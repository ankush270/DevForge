'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  FileText,
  Zap,
  Plus,
  X,
  ArrowRight,
  Flame,
  Compass,
} from 'lucide-react';
import { RetroWindowBar } from '@/components/common/RetroDeco';

function cleanPlainText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

interface TextSnippet {
  before: string;
  match: string;
  after: string;
}

function extractSnippet(text: string, query: string, windowChars = 40): TextSnippet | null {
  if (!text || !query) return null;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return null;

  const start = Math.max(0, index - windowChars);
  const end = Math.min(text.length, index + query.length + windowChars);

  const before = (start > 0 ? '… ' : '') + text.slice(start, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length, end) + (end < text.length ? ' …' : '');

  return { before, match, after };
}

interface SearchResultItem {
  noteId: string;
  title: string;
  subjectTitle: string;
  topicTitle: string;
  tags: string[];
  lastOpenedAt: string;
  score: number;
  matchType: 'title' | 'tag' | 'content' | 'recall' | 'subject';
  matchedModeId?: string;
  snippetSource?: string;
  snippet?: TextSnippet | null;
}

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Reset selected index whenever search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Index all notes with cleaned plaintext content, modes, and flashcards
  const indexedNotes = useMemo(() => {
    const list: {
      noteId: string;
      title: string;
      subjectTitle: string;
      topicTitle: string;
      tags: string[];
      lastOpenedAt: string;
      mainContentClean: string;
      modes: { id: string; name: string; contentClean: string }[];
      recalls: { id: string; questionClean: string; answerClean: string }[];
    }[] = [];

    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          list.push({
            noteId: n.id,
            title: n.title,
            subjectTitle: s.title,
            topicTitle: t.title,
            tags: n.tags || [],
            lastOpenedAt: n.lastOpenedAt,
            mainContentClean: cleanPlainText(n.contentMarkdown || ''),
            modes: (n.modes || []).map((m) => ({
              id: m.id,
              name: m.name,
              contentClean: cleanPlainText(m.contentMarkdown || ''),
            })),
            recalls: (n.activeRecallData || []).map((r) => ({
              id: r.id,
              questionClean: cleanPlainText(r.question || ''),
              answerClean: cleanPlainText(r.answer || ''),
            })),
          });
        });
      });
    });

    return list;
  }, [subjects]);

  // Quick Action definitions
  const quickActions = useMemo(
    () => [
      {
        id: 'act-revisions',
        title: 'Start Due Revisions Queue',
        badge: '⚡ Action',
        icon: Zap,
        colorClass: 'text-amber-400',
        action: () => {
          setIsCommandPaletteOpen(false);
          startRevisionQueue();
        },
      },
      {
        id: 'act-sprint',
        title: 'Launch Interview Sprint Mode (Target Company)',
        badge: '🎯 Mode',
        icon: Flame,
        colorClass: 'text-indigo-400',
        action: () => {
          setIsCommandPaletteOpen(false);
          setIsSprintModalOpen(true);
        },
      },
      {
        id: 'act-new-note',
        title: 'Create New Note',
        badge: 'Ctrl+N',
        icon: Plus,
        colorClass: 'text-emerald-400',
        action: () => {
          setIsCommandPaletteOpen(false);
          setIsQuickCaptureOpen(true);
        },
      },
      {
        id: 'act-guide',
        title: 'Product Guide & Keyboard Shortcuts',
        badge: '📖 Guide',
        icon: Compass,
        colorClass: 'text-sky-400',
        action: () => {
          setIsCommandPaletteOpen(false);
          setActiveView('landing');
        },
      },
    ],
    [
      setIsCommandPaletteOpen,
      startRevisionQueue,
      setIsSprintModalOpen,
      setIsQuickCaptureOpen,
      setActiveView,
    ]
  );

  // Filtered search results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    indexedNotes.forEach((n) => {
      let score = 0;
      let matchType: 'title' | 'tag' | 'content' | 'recall' | 'subject' = 'title';
      let snippet: TextSnippet | null = null;
      let snippetSource: string | undefined = undefined;
      let matchedModeId: string | undefined = undefined;

      const lowerTitle = n.title.toLowerCase();

      // 1. Title match
      if (lowerTitle.startsWith(q)) {
        score += 150;
        matchType = 'title';
      } else if (lowerTitle.includes(q)) {
        score += 100;
        matchType = 'title';
      }

      // 2. Tag match
      if (n.tags.some((t) => t.toLowerCase().includes(q))) {
        score += 70;
        if (!score || matchType !== 'title') matchType = 'tag';
      }

      // 3. Deep Body Content match (Modes & Main Content)
      for (const m of n.modes) {
        if (m.contentClean.toLowerCase().includes(q)) {
          score += 60;
          if (!snippet) {
            snippet = extractSnippet(m.contentClean, q);
            snippetSource = m.name;
            matchedModeId = m.id;
            if (matchType !== 'title') matchType = 'content';
          }
        }
      }

      if (n.mainContentClean.toLowerCase().includes(q)) {
        score += 55;
        if (!snippet) {
          snippet = extractSnippet(n.mainContentClean, q);
          snippetSource = 'Notes';
          if (matchType !== 'title') matchType = 'content';
        }
      }

      // 4. Active Recall / Flashcard match
      for (const r of n.recalls) {
        if (r.questionClean.toLowerCase().includes(q)) {
          score += 45;
          if (!snippet) {
            snippet = extractSnippet(r.questionClean, q);
            snippetSource = 'Flashcard Q';
            if (matchType !== 'title') matchType = 'recall';
          }
        } else if (r.answerClean.toLowerCase().includes(q)) {
          score += 45;
          if (!snippet) {
            snippet = extractSnippet(r.answerClean, q);
            snippetSource = 'Flashcard A';
            if (matchType !== 'title') matchType = 'recall';
          }
        }
      }

      // 5. Subject or Topic match
      if (
        n.subjectTitle.toLowerCase().includes(q) ||
        n.topicTitle.toLowerCase().includes(q)
      ) {
        score += 30;
        if (!score || (matchType !== 'title' && matchType !== 'content')) {
          matchType = 'subject';
        }
      }

      if (score > 0) {
        results.push({
          noteId: n.noteId,
          title: n.title,
          subjectTitle: n.subjectTitle,
          topicTitle: n.topicTitle,
          tags: n.tags,
          lastOpenedAt: n.lastOpenedAt,
          score,
          matchType,
          matchedModeId,
          snippetSource,
          snippet,
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 15);
  }, [indexedNotes, query]);

  // Recent notes when query is empty
  const recentNotes = useMemo(() => {
    return [...indexedNotes]
      .sort(
        (a, b) =>
          new Date(b.lastOpenedAt || 0).getTime() -
          new Date(a.lastOpenedAt || 0).getTime()
      )
      .slice(0, 5);
  }, [indexedNotes]);

  // Total selectable items for arrow navigation
  const totalItems = query.trim()
    ? filteredResults.length
    : quickActions.length + recentNotes.length;

  // Auto-scroll selected element into view
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Keyboard navigation listener (ArrowUp, ArrowDown, Enter, Esc)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalItems > 0 ? (prev + 1) % totalItems : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalItems > 0 ? (prev - 1 + totalItems) % totalItems : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        const item = filteredResults[selectedIndex];
        if (item) {
          setIsCommandPaletteOpen(false);
          openNote(item.noteId, item.matchedModeId);
        }
      } else {
        if (selectedIndex < quickActions.length) {
          quickActions[selectedIndex]?.action();
        } else {
          const recentIndex = selectedIndex - quickActions.length;
          const note = recentNotes[recentIndex];
          if (note) {
            setIsCommandPaletteOpen(false);
            openNote(note.noteId);
          }
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <RetroWindowBar title="Find.exe — Global Full-Text Search" onClose={() => setIsCommandPaletteOpen(false)} />
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <Search className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Deep search notes, body content, code snippets, #tags, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-4 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-xs text-[var(--muted)] hover:text-[var(--foreground)] mr-1 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2.5 space-y-2">
          {/* Quick Actions (when query is empty) */}
          {!query && (
            <div className="mb-2">
              <span className="px-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Quick Actions
              </span>
              <div className="mt-1.5 space-y-1">
                {quickActions.map((action, idx) => {
                  const isSelected = selectedIndex === idx;
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      onClick={action.action}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                          : 'bg-transparent border-transparent hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${action.colorClass}`} />
                        <span className="font-semibold text-[var(--foreground)]">{action.title}</span>
                      </div>
                      <span className="text-xs text-[var(--muted)] font-mono">{action.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Results */}
          <div>
            <div className="px-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                {query ? `Search Results (${filteredResults.length})` : 'Recently Viewed Notes'}
              </span>
              {query && (
                <span className="text-[10px] text-indigo-400 font-medium">
                  Deep Content Search Active
                </span>
              )}
            </div>

            <div className="mt-1.5 space-y-1.5">
              {query ? (
                filteredResults.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[var(--muted)] space-y-1">
                    <p className="font-medium text-[var(--foreground)]">No matching notes or content found</p>
                    <p className="text-xs">Try searching by topic, tag, code keyword, or formula</p>
                  </div>
                ) : (
                  filteredResults.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={item.noteId}
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        onClick={() => {
                          setIsCommandPaletteOpen(false);
                          openNote(item.noteId, item.matchedModeId);
                        }}
                        className={`w-full p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-500/15 border-indigo-500/40 shadow-xs'
                            : 'bg-transparent border-transparent hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText
                              className={`w-4 h-4 flex-shrink-0 ${
                                isSelected ? 'text-indigo-400' : 'text-[var(--muted)]'
                              }`}
                            />
                            <span
                              className={`font-semibold truncate text-sm ${
                                isSelected ? 'text-indigo-300' : 'text-[var(--foreground)]'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-xs text-[var(--muted)] truncate hidden sm:inline">
                              in {item.subjectTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {item.matchType === 'content' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Body Content
                              </span>
                            )}
                            {item.matchType === 'recall' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                Flashcard
                              </span>
                            )}
                            {item.matchType === 'tag' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                Tag Match
                              </span>
                            )}
                            {item.matchType === 'title' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/20">
                                Title Match
                              </span>
                            )}
                            <ArrowRight
                              className={`w-3.5 h-3.5 transition-transform ${
                                isSelected ? 'translate-x-0.5 text-indigo-400' : 'text-[var(--muted)]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* 🔍 Deep Content Snippet Preview */}
                        {item.snippet && (
                          <div className="mt-2 ml-6 p-2 rounded-lg bg-[var(--surface-hover)]/90 border border-[var(--border)] text-xs text-[var(--muted)] font-mono leading-relaxed flex items-start gap-2 overflow-hidden">
                            {item.snippetSource && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-sans text-[10px] font-bold flex-shrink-0">
                                {item.snippetSource}
                              </span>
                            )}
                            <div className="truncate">
                              <span>{item.snippet.before}</span>
                              <mark className="bg-amber-400/35 text-amber-300 font-bold px-1 py-0.5 rounded mx-0.5">
                                {item.snippet.match}
                              </mark>
                              <span>{item.snippet.after}</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })
                )
              ) : (
                recentNotes.map((note, idx) => {
                  const globalIdx = quickActions.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <button
                      key={note.noteId}
                      ref={(el) => {
                        itemRefs.current[globalIdx] = el;
                      }}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        openNote(note.noteId);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                          : 'bg-transparent border-transparent hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText
                          className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-indigo-400' : 'text-[var(--muted)]'
                          }`}
                        />
                        <div className="truncate">
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-indigo-300' : 'text-[var(--foreground)]'
                            }`}
                          >
                            {note.title}
                          </span>
                          <span className="ml-2 text-xs text-[var(--muted)]">in {note.subjectTitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {note.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-xs bg-[var(--surface-hover)] text-[var(--muted)] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'translate-x-0.5 text-indigo-400' : 'text-[var(--muted)]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-hover)]/40 flex items-center justify-between text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-xs">
              ↑↓
            </kbd>
            <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-xs">
              Enter
            </kbd>
          </div>
          <span>Esc to Close</span>
        </div>
      </div>
    </div>
  );
}

