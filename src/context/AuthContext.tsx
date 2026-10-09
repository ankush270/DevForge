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
  canEditSubject: (subject?: { userId?: string } | Subject | null) => boolean;
  requireAuth: (actionName?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'devforge_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authReason, setAuthReason] = useState('');

  // 1. Initialize user from Supabase or LocalStorage session
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            });
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session fetch failed, falling back to local storage:', err);
        }
      }

      // Check local storage session
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
      setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth state change
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const newUser: AppUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
        } else {
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

  // Sign in
  const signIn = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'DevForgePass123!',
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const loggedUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          };
          setUser(loggedUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loggedUser));
          closeAuthModal();
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    }

    // Local / Offline fallback auth
    const localUser: AppUser = {
      id: `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
      email,
      name: email.split('@')[0],
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
    closeAuthModal();
    return { success: true };
  };

  // Sign up
  const signUp = async (email: string, password = '', name = ''): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'DevForgePass123!',
          options: {
            data: { name: name || email.split('@')[0] },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const newUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: name || data.user.user_metadata?.name || email.split('@')[0],
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
          closeAuthModal();
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Sign up failed' };
      }
    }

    // Local / Offline fallback registration
    const localUser: AppUser = {
      id: `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
      email,
      name: name || email.split('@')[0],
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
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

    // 2. If the note is unassigned (legacy note), the currently logged-in user can edit and claim it
    if (!note.userId) return true;

    // 3. User can ONLY edit their own written content
    return note.userId === user.id;
  };

  const canEditSubject = (subject?: { userId?: string } | Subject | null): boolean => {
    if (!user) return false;
    if (!subject) return false;
    if (!subject.userId) return true;
    return subject.userId === user.id;
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
