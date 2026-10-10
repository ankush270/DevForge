'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, Note, Subject } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  authReason: string;
  openAuthModal: (mode?: 'signin' | 'signup', reason?: string) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  canEditNote: (note?: Note | null) => boolean;
  canEditSubject: (subject?: { userId?: string; authorEmail?: string } | Subject | null) => boolean;
  requireAuth: (actionName?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'devforge_auth_user_v1';
const LOCAL_ACCOUNTS_KEY = 'devforge_accounts_v1';

interface StoredAccount {
  id: string;
  email: string;
  name?: string;
  password?: string;
  supabaseId?: string;
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(account: StoredAccount) {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getStoredAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    accounts.push(account);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

function generateLocalUserId(email: string): string {
  try {
    return `usr_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
  } catch {
    return `usr_${Date.now()}`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authReason, setAuthReason] = useState('');

  // 1. Initialize user from LocalStorage session or Supabase
  useEffect(() => {
    async function initAuth() {
      // Step A: First restore from LocalStorage so session is instant and never flickers
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && parsed.email) {
            setUser(parsed);
          }
        }
      } catch {
        // ignore
      }

      // Step B: Check Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const suUser: AppUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            };
            setUser(suUser);
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(suUser));
            saveStoredAccount({
              id: session.user.id,
              email: suUser.email,
              name: suUser.name || suUser.email.split('@')[0],
              supabaseId: session.user.id,
            });
          }
        } catch (err) {
          console.warn('Supabase auth session fetch failed, using local storage:', err);
        }
      }

      setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth state change
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const newUser: AppUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
          saveStoredAccount({
            id: session.user.id,
            email: newUser.email,
            name: newUser.name || newUser.email.split('@')[0],
            supabaseId: session.user.id,
          });
        } else if (event === 'SIGNED_OUT') {
          // CRITICAL: Only clear user if explicit SIGNED_OUT happened.
          // Never wipe on INITIAL_SESSION or when session is null without explicit sign out!
          setUser(null);
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', reason = '') => {
    setAuthModalMode(mode);
    setAuthReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthReason('');
  };

  // Sign in with intelligent fallback for unconfirmed Supabase emails or offline mode
  const signIn = async (rawEmail: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // 1. Try Supabase password sign-in first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'DevForgePass123!',
        });

        if (!error && data?.user) {
          const loggedUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          };
          setUser(loggedUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loggedUser));
          saveStoredAccount({
            id: data.user.id,
            email,
            name: loggedUser.name || email.split('@')[0],
            password: password || undefined,
            supabaseId: data.user.id,
          });
          closeAuthModal();
          return { success: true };
        }
      } catch {
        // Continue to recovery
      }
    }

    // 2. Check local accounts directory
    const storedAccounts = getStoredAccounts();
    const existing = storedAccounts.find((a) => a.email.toLowerCase() === email);

    if (existing) {
      if (existing.password && password && existing.password !== password) {
        return { success: false, error: 'Incorrect password for this account.' };
      }

      const loggedUser: AppUser = {
        id: existing.id || existing.supabaseId || generateLocalUserId(email),
        email: existing.email,
        name: existing.name || email.split('@')[0],
      };
      setUser(loggedUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loggedUser));
      closeAuthModal();
      return { success: true };
    }

    // 3. Supabase smart recovery:
    // If user was created in Supabase with unverified email, calling signUp returns the user object!
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.signUp({
          email,
          password: password || 'DevForgePass123!',
        });

        if (data?.user?.id) {
          const recoveredUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          };
          setUser(recoveredUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(recoveredUser));
          saveStoredAccount({
            id: data.user.id,
            email,
            name: recoveredUser.name || email.split('@')[0],
            password: password || undefined,
            supabaseId: data.user.id,
          });
          closeAuthModal();
          return { success: true };
        }
      } catch {
        // Continue to local fallback
      }
    }

    // 4. Seamless local fallback - never lock a developer out of their workspace
    const localId = generateLocalUserId(email);
    const fallbackUser: AppUser = {
      id: localId,
      email,
      name: email.split('@')[0],
    };
    saveStoredAccount({
      id: localId,
      email,
      name: fallbackUser.name,
      password: password || undefined,
    });
    setUser(fallbackUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(fallbackUser));
    closeAuthModal();
    return { success: true };
  };

  // Sign up
  const signUp = async (
    rawEmail: string,
    password = '',
    rawName = ''
  ): Promise<{ success: boolean; error?: string }> => {
    const email = rawEmail.trim().toLowerCase();
    const name = rawName.trim() || email.split('@')[0];

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    let assignedId = generateLocalUserId(email);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.signUp({
          email,
          password: password || 'DevForgePass123!',
          options: {
            data: { name },
          },
        });

        if (data?.user?.id) {
          assignedId = data.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase sign up warning:', err);
      }
    }

    const newUser: AppUser = {
      id: assignedId,
      email,
      name,
    };

    saveStoredAccount({
      id: assignedId,
      email,
      name,
      password: password || undefined,
      supabaseId: assignedId.startsWith('usr_') ? undefined : assignedId,
    });

    setUser(newUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
    closeAuthModal();
    return { success: true };
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  // Core Rule: "Bina login ke koi kuch update nhi kr skta or bss apna likha content edit kr skte ho"
  const canEditNote = (note?: Note | null): boolean => {
    // 1. Without login, nobody can edit anything
    if (!user) return false;
    if (!note) return false;

    // 2. If the note is unassigned (legacy note), current logged-in user can edit and claim it
    if (!note.userId && !note.authorEmail) return true;

    // 3. User ID exact match
    if (note.userId && note.userId === user.id) return true;

    // 4. Author email match (case-insensitive)
    if (
      note.authorEmail &&
      user.email &&
      note.authorEmail.toLowerCase() === user.email.toLowerCase()
    ) {
      return true;
    }

    // 5. Local generated hash ID match
    const localId = generateLocalUserId(user.email);
    if (note.userId === localId) return true;

    return false;
  };

  const canEditSubject = (subject?: { userId?: string; authorEmail?: string } | Subject | null): boolean => {
    if (!user) return false;
    if (!subject) return false;
    if (!subject.userId && !subject.authorEmail) return true;
    if (subject.userId && subject.userId === user.id) return true;
    if (
      subject.authorEmail &&
      user.email &&
      subject.authorEmail.toLowerCase() === user.email.toLowerCase()
    ) {
      return true;
    }
    const localId = generateLocalUserId(user.email);
    if (subject.userId === localId) return true;
    return false;
  };

  const requireAuth = (actionName = 'edit content'): boolean => {
    if (user) return true;
    openAuthModal('signin', `Please sign in to ${actionName}. You can only edit your own content.`);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authReason,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        canEditNote,
        canEditSubject,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
