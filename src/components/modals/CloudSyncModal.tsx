'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Database,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldCheck,
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '@/lib/cloudSync';

export function CloudSyncModal() {
  const {
    isCloudSyncModalOpen,
    setIsCloudSyncModalOpen,
    cloudStatus,
    cloudHealth,
    checkAndSyncCloud,
    forcePushToCloud,
    forcePullFromCloud,
    lastSyncedAt,
    totalNotesCount,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isCloudSyncModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setActionMessage(null);
    try {
      const res = await checkAndSyncCloud();
      if (res.hasTables) {
        setActionMessage('✅ Supabase connected and synced successfully!');
      } else {
        setActionMessage('⚠️ Tables not detected yet. Please paste the SQL into your Supabase SQL Editor and click "Run".');
      }
    } catch {
      setActionMessage('Failed to connect to Supabase.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePush = async () => {
    setIsVerifying(true);
    setActionMessage(null);
    const success = await forcePushToCloud();
    setIsVerifying(false);
    if (success) {
      setActionMessage('🚀 All local notes pushed to Supabase Cloud!');
    } else {
      setActionMessage('Push failed. Check connection or verify tables.');
    }
  };

  const handlePull = async () => {
    setIsVerifying(true);
    setActionMessage(null);
    const success = await forcePullFromCloud();
    setIsVerifying(false);
    if (success) {
      setActionMessage('📥 Notes restored from Supabase Cloud to local device!');
    } else {
      setActionMessage('Pull failed or no data in cloud.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCloudSyncModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">Supabase Cloud Sync</h2>
                {cloudStatus === 'synced' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Synced
                  </span>
                )}
                {cloudStatus === 'needs_setup' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    SQL Setup Required
                  </span>
                )}
                {cloudStatus === 'syncing' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400">
                    Syncing...
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">
                Real-time backup and multi-device persistence powered by Supabase
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCloudSyncModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Message Alert */}
          {actionMessage && (
            <div className="p-3.5 rounded-xl border text-sm font-medium bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
              {actionMessage}
            </div>
          )}

          {/* Connected URL Info */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[var(--muted)]">Connected Project: </span>
                <span className="font-mono font-semibold text-[var(--foreground)]">
                  https://najcyhmzogoheqxqlkur.supabase.co
                </span>
              </div>
            </div>
            {lastSyncedAt && (
              <span className="text-xs text-[var(--muted)] font-mono">
                Last sync: {lastSyncedAt.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* If tables are already setup */}
          {cloudHealth.hasTables ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Cloud Sync is Fully Operational</h4>
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    Har ek note, subject, aur review log LocalStorage ke saath-saath Supabase me real-time sync ho raha hai. Aap kisi bhi device par apna account kholkar same data access kar sakte hain.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePush}
                  disabled={isVerifying}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] hover:border-emerald-500/50 hover:bg-emerald-500/10 text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Push Local Notes to Cloud</span>
                </button>

                <button
                  onClick={handlePull}
                  disabled={isVerifying}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] hover:border-indigo-500/50 hover:bg-indigo-500/10 text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <ArrowDownCircle className="w-4 h-4 text-indigo-400" />
                  <span>Pull Cloud Notes to Local</span>
                </button>
              </div>
            </div>
          ) : (
            /* If tables need setup */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">1 Step Remaining: Run Setup SQL in Supabase</h4>
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    Supabase connection successful hai! Bas database me tables create karne ke liye neeche diya gaya SQL script apne Supabase dashboard ke <strong>SQL Editor</strong> me paste karke <strong>Run</strong> karein.
                  </p>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="space-y-2 text-xs sm:text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Supabase Dashboard me SQL Editor kholein:</span>
                  <a
                    href="https://supabase.com/dashboard/project/najcyhmzogoheqxqlkur/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    <span>Open SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2 font-semibold text-[var(--foreground)] pt-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Neeche diye button se Migration SQL copy karein aur wahan paste karke <b>Run</b> dabayein:</span>
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl border border-[var(--border)] bg-[#0d1117] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--border)] bg-[#161b22]">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    interview_os_schema.sql
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="p-3.5 text-xs font-mono text-emerald-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>

              {/* Verify Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[var(--muted)]">
                  SQL Run karne ke baad neeche <strong>Test & Sync</strong> dabayein:
                </p>

                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Verifying...' : 'Test & Sync Now ➔'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Safety Note */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Aapka data local browser me safe rehta hai even if cloud is offline. Total notes currently: <b>{totalNotesCount}</b>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
