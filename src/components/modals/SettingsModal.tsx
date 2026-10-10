'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  X,
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  Check,
  FileArchive,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { RetroWindowBar } from '@/components/common/RetroDeco';

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    dailyReviewCap,
    setDailyReviewCap,
    cloudStatus,
    setIsCloudSyncModalOpen,
    exportNotesToZip,
    exportDataAsJson,
    importDataFromJson,
    resetToDefaultData,
    totalNotesCount,
  } = useApp();

  const { theme, setTheme } = useTheme();
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleZipDownload = async () => {
    setIsExportingZip(true);
    try {
      await exportNotesToZip();
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDataFromJson(content);
      if (ok) {
        setImportStatus('Backup successfully restored!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <RetroWindowBar title="Settings.exe — Platform Preferences" onClose={() => setIsSettingsOpen(false)} />
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Platform Settings</h2>
              <p className="text-xs text-[var(--muted)]">Preferences, Portability & Burnout Protection</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Daily Review Cap (Burnout Protection) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">Daily Review Cap (Fatigue Protection)</h3>
                <p className="text-xs text-[var(--muted)]">
                  Maximum number of cards presented per day. Overdue cards roll over automatically.
                </p>
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold text-indigo-400 px-2.5 py-1 rounded bg-indigo-500/10">
                {dailyReviewCap} Cards / Day
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[5, 10, 15, 20, 30].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setDailyReviewCap(cap)}
                  className={`py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    dailyReviewCap === cap
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                      : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Theme Preferences */}
          <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Color Theme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('retro-y2k')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  theme === 'retro-y2k'
                    ? 'border-pink-500 bg-pink-500/15 text-pink-500 font-bold shadow-sm'
                    : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                <span>Retro Y2K (Bubblegum)</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                    : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode (Console)</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                    : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode (Clean Paper)</span>
              </button>
            </div>
          </div>

          {/* Supabase Cloud Real-time Sync */}
          <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>Supabase Real-Time Cloud Sync</span>
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Backup your entire knowledge base in real-time to your Supabase PostgreSQL cloud database.
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                cloudStatus === 'synced'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : cloudStatus === 'needs_setup'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : cloudStatus === 'syncing'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
              }`}>
                {cloudStatus === 'synced' ? '🟢 Live Synced' : cloudStatus === 'needs_setup' ? '⚠️ Setup Needed' : cloudStatus === 'syncing' ? 'Syncing...' : 'Local Only'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
                setIsCloudSyncModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs sm:text-sm font-bold text-indigo-300 transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Open Supabase Cloud Sync Manager & SQL Setup ➔</span>
            </button>
          </div>

          {/* 3. Anti-Vendor Lock-in: 1-Click Markdown ZIP Export */}
          <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <FileArchive className="w-4 h-4 text-emerald-400" />
                <span>Zero Vendor Lock-in (Markdown ZIP Export)</span>
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Download all your notes formatted in folders (<code>/Subject/Topic/Note.md</code>) with YAML frontmatter. 100% compatible with Obsidian, Foam, and Notion.
              </p>
            </div>

            <button
              type="button"
              onClick={handleZipDownload}
              disabled={isExportingZip}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingZip ? 'Packing ZIP Archive...' : `Export All ${totalNotesCount} Notes as ZIP (.md)`}</span>
            </button>
          </div>

          {/* 4. Full JSON Backup & Restore */}
          <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Complete Data Backup & Restore</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportDataAsJson}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs sm:text-sm text-[var(--foreground)] font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs sm:text-sm text-[var(--foreground)] font-medium transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {importStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm text-center font-medium">
                {importStatus}
              </div>
            )}
          </div>

          {/* 5. Reset Workspace */}
          <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-rose-400">Clear All Data (100% Clean Slate)</h4>
              <p className="text-xs text-[var(--muted)]">Deletes all dummy data, notes, and resets workspace completely to 0.</p>
            </div>
            <button
              type="button"
              onClick={resetToDefaultData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-hover)]/30 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
