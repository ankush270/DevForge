'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { X, Sparkles, Plus, Code, BookOpen, Lock } from 'lucide-react';

export function QuickCaptureModal() {
  const { isQuickCaptureOpen, setIsQuickCaptureOpen, subjects, addNote, addTopic, addSubject } = useApp();
  const { user, requireAuth } = useAuth();

  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isDsaProblem, setIsDsaProblem] = useState(false);

  useEffect(() => {
    if (isQuickCaptureOpen) {
      setTitle('');
      setNewSubjectName('');
      if (subjects.length > 0) {
        setSelectedSubjectId(subjects[0].id);
        if (subjects[0].topics.length > 0) {
          setSelectedTopicId(subjects[0].topics[0].id);
        } else {
          setSelectedTopicId('');
        }
      } else {
        setSelectedSubjectId('');
        setSelectedTopicId('');
      }
    }
  }, [isQuickCaptureOpen, subjects]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const availableTopics = activeSubject?.topics || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('create notes')) {
      setIsQuickCaptureOpen(false);
      return;
    }
    if (!title.trim()) return;

    let targetSubjectId = selectedSubjectId;
    if (subjects.length === 0) {
      if (!newSubjectName.trim()) return;
      const createdSub = addSubject(newSubjectName.trim(), 'Layers', 'indigo');
      targetSubjectId = createdSub.id;
    } else if (!targetSubjectId) {
      return;
    }

    let targetTopicId = selectedTopicId;
    if (!targetTopicId) {
      // Create a default topic if subject has none
      const createdTopic = addTopic(targetSubjectId, 'General Concepts');
      targetTopicId = createdTopic.id;
    }

    const tags = tagsInput
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addNote(targetTopicId, title.trim(), '', tags, isDsaProblem);
    setIsQuickCaptureOpen(false);
  };

  if (!isQuickCaptureOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsQuickCaptureOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-base">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Quick Note Capture</h2>
          </div>
          <button
            onClick={() => setIsQuickCaptureOpen(false)}
            className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Note Title Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Note Title / Topic Concept
            </label>
            <input
              type="text"
              placeholder="e.g. Raft Consensus Algorithm vs Paxos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="w-full px-3.5 py-2.5 text-sm sm:text-base rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subject & Topic Selectors */}
          {subjects.length === 0 ? (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[var(--muted)] mb-1.5">
                New Subject Name (Workspace is clean)
              </label>
              <input
                type="text"
                placeholder="e.g. Operating Systems, System Design, DSA, etc."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[var(--muted)] mb-1.5">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const sub = subjects.find((s) => s.id === e.target.value);
                    if (sub && sub.topics.length > 0) {
                      setSelectedTopicId(sub.topics[0].id);
                    } else {
                      setSelectedTopicId('');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[var(--muted)] mb-1.5">
                  Topic Category
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none"
                >
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                  {availableTopics.length === 0 && (
                    <option value="">General (Auto-created)</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Tags Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[var(--muted)] mb-1.5">
              Tags (Optional - e.g. #Amazon #P0 #Round2)
            </label>
            <input
              type="text"
              placeholder="#Amazon #SystemDesign #MustRevise"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </div>

          {/* DSA Toggle */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--surface-hover)]/60 border border-[var(--border)]">
            <input
              type="checkbox"
              id="isDsaCheckbox"
              checked={isDsaProblem}
              onChange={(e) => setIsDsaProblem(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isDsaCheckbox" className="text-xs sm:text-sm text-[var(--foreground)] cursor-pointer select-none">
              This is a <strong>DSA / LeetCode Problem</strong> (enables Time/Space complexity badges)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(false)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              Create Note & Open Editor ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
