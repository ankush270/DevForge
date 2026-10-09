'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Flame, Zap, Target, CheckCircle2 } from 'lucide-react';

export function InterviewSprintModal() {
  const { isSprintModalOpen, setIsSprintModalOpen, subjects, startRevisionQueue } = useApp();

  const [selectedTag, setSelectedTag] = useState('');

  // Find all unique company/priority tags
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, { total: number; urgent: number }> = {};

    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          n.tags.forEach((tag) => {
            if (!counts[tag]) counts[tag] = { total: 0, urgent: 0 };
            counts[tag].total += 1;
            if (n.masteryLevel === 'RED' || n.masteryLevel === 'YELLOW') {
              counts[tag].urgent += 1;
            }
          });
        });
      });
    });

    return Object.entries(counts).map(([tag, data]) => ({
      tag,
      ...data,
    }));
  }, [subjects]);

  useEffect(() => {
    if (allTagsWithCounts.length > 0 && (!selectedTag || !allTagsWithCounts.some((t) => t.tag === selectedTag))) {
      setSelectedTag(allTagsWithCounts[0].tag);
    }
  }, [allTagsWithCounts, selectedTag]);

  if (!isSprintModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSprintModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-base">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Interview Sprint Mode</h2>
              <p className="text-xs text-[var(--muted)]">Targeted Cramming for Upcoming Rounds</p>
            </div>
          </div>
          <button
            onClick={() => setIsSprintModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Select an upcoming company or topic priority tag. The engine will filter out irrelevant notes and create an intensive review queue of your weak (🔴/🟡) concepts.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {allTagsWithCounts.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl space-y-2">
                <Target className="w-7 h-7 text-[var(--muted)] mx-auto opacity-40" />
                <p className="font-semibold text-[var(--foreground)] text-base">No tags found</p>
                <p className="text-xs">Add tags like #Amazon, #Google, or #SystemDesign to your notes to enable Sprint Mode.</p>
              </div>
            ) : (
              allTagsWithCounts.map(({ tag, total, urgent }) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-sm'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 font-semibold">
                      <Target className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-[var(--muted)]'}`} />
                      <span>{tag}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {urgent > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400">
                          {urgent} Urgent
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">Ready</span>
                      )}
                      <span className="text-xs text-[var(--muted)] font-medium">{total} notes</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              onClick={() => setIsSprintModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectedTag) return;
                setIsSprintModalOpen(false);
                startRevisionQueue(selectedTag);
              }}
              disabled={allTagsWithCounts.length === 0 || !selectedTag}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              <span>{selectedTag ? `Launch ${selectedTag} Sprint ➔` : 'Select Tag to Sprint ➔'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
