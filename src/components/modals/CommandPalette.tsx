'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  FileText,
  Zap,
  LayoutDashboard,
  Plus,
  Hash,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    subjects,
    openNote,
    setActiveView,
    startRevisionQueue,
    setIsQuickCaptureOpen,
    setIsSprintModalOpen,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  // Aggregate all notes for fuzzy search
  const allNotes = useMemo(() => {
    const list: { noteId: string; title: string; subjectTitle: string; tags: string[] }[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          list.push({
            noteId: n.id,
            title: n.title,
            subjectTitle: s.title,
            tags: n.tags,
          });
        });
      });
    });
    return list;
  }, [subjects]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return allNotes.slice(0, 5);
    const q = query.toLowerCase();
    return allNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subjectTitle.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [allNotes, query]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--muted)] mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search notes, topics, #Amazon tags, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 bg-transparent border-none outline-none text-base text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2.5 space-y-2">
          {/* Quick Actions (when query is empty) */}
          {!query && (
            <div className="mb-2">
              <span className="px-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                Quick Actions
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    startRevisionQueue();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--surface-hover)] text-left group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold">Start Due Revisions Queue</span>
                  </div>
                  <span className="text-xs text-[var(--muted)] font-mono">⚡ Action</span>
                </button>

                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setIsSprintModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--surface-hover)] text-left group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-indigo-400">
                    <Flame className="w-4 h-4" />
                    <span className="font-semibold">Launch Interview Sprint Mode (Target Company)</span>
                  </div>
                  <span className="text-xs text-[var(--muted)] font-mono">🎯 Mode</span>
                </button>

                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setIsQuickCaptureOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--surface-hover)] text-left group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-[var(--foreground)]">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold">Create New Note</span>
                  </div>
                  <span className="text-xs text-[var(--muted)] font-mono">Ctrl+N</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes Results */}
          <div>
            <span className="px-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              Notes & Knowledge
            </span>
            <div className="mt-1.5 space-y-1">
              {filteredNotes.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--muted)]">
                  No notes match your search. Try another keyword.
                </div>
              ) : (
                filteredNotes.map((item) => (
                  <button
                    key={item.noteId}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      openNote(item.noteId);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-indigo-500/10 hover:text-indigo-300 text-left group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-[var(--muted)] group-hover:text-indigo-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[var(--foreground)] group-hover:text-indigo-300">
                          {item.title}
                        </span>
                        <span className="ml-2 text-xs text-[var(--muted)]">
                          in {item.subjectTitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-xs bg-[var(--surface-hover)] text-[var(--muted)] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                      <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-hover)]/40 flex items-center justify-between text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-xs">
              ↑↓
            </kbd>
            <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-xs">
              Enter
            </kbd>
          </div>
          <span>Close: Esc</span>
        </div>
      </div>
    </div>
  );
}
