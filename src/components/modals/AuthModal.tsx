'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/common/DevForgeLogo';
import { RetroWindowBar } from '@/components/common/RetroDeco';
import { X, Lock, Mail, User, Key, ArrowRight, LockKeyhole, AlertCircle, Terminal } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    authReason,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authModalMode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign in. Check your credentials.');
        } else {
          closeAuthModal();
        }
      } else {
        const res = await signUp(email.trim(), password, name.trim());
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create account.');
        } else {
          closeAuthModal();
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    await signIn('demo.engineer@devforge.dev', 'DevForge123!');
    setIsLoading(false);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <RetroWindowBar title="Auth.exe — Access Control" onClose={closeAuthModal} />

        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <DevForgeLogo size="sm" showText={true} />
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Gate Warning (if triggered by edit action) */}
        {authReason && (
          <div className="px-5 pt-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
              <Lock className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block text-amber-400 font-semibold mb-0.5">Authorization Required</strong>
                <span>{authReason}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                openAuthModal('signin', authReason);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authModalMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                openAuthModal('signup', authReason);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="e.g. Linus Torvalds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                placeholder="engineer@devforge.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-sky-500"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-sky-600/25 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : authModalMode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Login */}
          <div className="pt-2 text-center">
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-[var(--muted)]">
                <span className="bg-[var(--surface)] px-2">Instant Developer Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Launch Demo Engineer Session</span>
            </button>
          </div>
        </form>

        {/* Security Footer */}
        <div className="p-3 bg-[var(--surface-hover)]/40 border-t border-[var(--border)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted)]">
          <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session • Notes remain private to your local storage or Supabase account</span>
        </div>
      </div>
    </div>
  );
}
