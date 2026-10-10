'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ReviewRating, Note } from '@/types';
import confetti from 'canvas-confetti';
import {
  X,
  Flame,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { isHtmlContent, markdownToHtml } from '@/lib/wysiwyg';

export function FocusDeck() {
  const {
    dueNotesQueue,
    recordReview,
    setActiveView,
    streak,
    filterTag,
    setFilterTag,
    startRevisionQueue,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    { noteTitle: string; rating: ReviewRating; nextDays: string }[]
  >([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const currentNote: Note | undefined = dueNotesQueue[currentIndex];
  const totalCards = dueNotesQueue.length;

  useEffect(() => {
    setStartTime(Date.now());
    setIsRevealed(false);
  }, [currentIndex]);

  // Handle Confetti on session completion
  useEffect(() => {
    if (isSessionFinished) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Fallback gracefully
      }
    }
  }, [isSessionFinished]);

  // Keyboard navigation: Space/Enter (Reveal), 1/2/3/4 (Grade), Esc (Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSessionFinished) return;

      if (e.key === 'Escape') {
        setActiveView('dashboard');
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!isRevealed) {
          e.preventDefault();
          setIsRevealed(true);
        }
      } else if (isRevealed) {
        if (e.key === '1') handleRate('AGAIN');
        else if (e.key === '2') handleRate('HARD');
        else if (e.key === '3') handleRate('GOOD');
        else if (e.key === '4') handleRate('EASY');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isSessionFinished, currentNote]);

  const handleRate = (rating: ReviewRating) => {
    if (!currentNote) return;

    const timeSpent = startTime > 0 ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 1;
    recordReview(currentNote.id, rating, timeSpent);

    const nextDays =
      rating === 'AGAIN' ? 'Tomorrow' : rating === 'HARD' ? 'In 2 days' : rating === 'GOOD' ? 'In 6 days' : 'In 16 days';

    setSessionResults((prev) => [
      ...prev,
      {
        noteTitle: currentNote.title,
        rating,
        nextDays,
      },
    ]);

    if (currentIndex + 1 >= totalCards) {
      setIsSessionFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // If no due cards at all when opening
  if (totalCards === 0 && !isSessionFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--background)]">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 text-3xl">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">No cards due for revision!</h2>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-md mt-2 mb-6 leading-relaxed">
          Your memory retention is optimal. All scheduled topics have been cleared for today.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 🎊 Milestone Completion Screen (Dopamine Hub)
  if (isSessionFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-2xl mx-auto w-full animate-in fade-in duration-200">
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 space-y-6 shadow-2xl text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 text-3xl">
            🏆
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Revision Sprint Completed!
            </h2>
            <p className="text-sm text-[var(--muted)]">
              You reviewed {sessionResults.length} concept cards and reinforced your long-term retention.
            </p>
          </div>

          {/* Streak Celebration Banner */}
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm sm:text-base font-bold text-orange-400">
              Current Streak Maintained: {streak} Days 🔥 (+1 today)
            </span>
          </div>

          {/* Session Summary Matrix */}
          <div className="space-y-2.5 text-left">
            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              Concepts Reviewed & Next Schedule:
            </span>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {sessionResults.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-hover)]/60 text-sm border border-[var(--border)]"
                >
                  <span className="font-semibold text-[var(--foreground)] truncate max-w-[280px]">
                    {res.noteTitle}
                  </span>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        res.rating === 'AGAIN'
                          ? 'bg-rose-500/20 text-rose-400'
                          : res.rating === 'HARD'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {res.rating}
                    </span>
                    <span className="text-xs text-[var(--muted)] font-mono">{res.nextDays}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Choices */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              🏠 Return to Dashboard
            </button>

            <button
              onClick={() => {
                setFilterTag(null);
                startRevisionQueue();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review More Cards ➔</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active recall question extraction from note if available
  const recallQuestion = currentNote?.activeRecallData?.[0]?.question || currentNote?.title;
  const recallAnswer = currentNote?.activeRecallData?.[0]?.answer || currentNote?.contentMarkdown;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--background)] p-4 sm:p-6 md:p-8 select-none">
      {/* 🧭 Top Minimalist Progress Bar */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--muted)] mb-1.5 font-medium">
            <span className="font-mono">
              Card {currentIndex + 1} of {totalCards}
            </span>
            {filterTag && (
              <span className="px-2.5 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                Filter: {filterTag}
              </span>
            )}
          </div>
          <div className="w-full bg-[var(--surface-hover)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          title="Exit to Dashboard (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 🗂️ Central Active Recall Card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div
          onClick={() => {
            if (!isRevealed) setIsRevealed(true);
          }}
          className={`w-full rounded-2xl border transition-all duration-200 cursor-pointer shadow-xl p-6 sm:p-8 flex flex-col justify-between min-h-[360px] ${
            isRevealed
              ? 'border-indigo-500/30 bg-[var(--surface)] ring-1 ring-indigo-500/20'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/40 hover:shadow-indigo-500/5'
          }`}
        >
          {/* Question / Concept Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                🎯 Active Recall Prompt
              </span>
              <span className="text-xs font-mono text-[var(--muted)]">
                {isRevealed ? 'Revealed' : 'Tap to Reveal (Spacebar)'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-snug">
              {recallQuestion}
            </h3>
          </div>

          {/* Answer Section */}
          <div className="my-6">
            {isRevealed ? (
              <div
                className="p-4 rounded-xl bg-[var(--surface-hover)]/70 border border-[var(--border)] text-sm sm:text-base text-[var(--foreground)] leading-relaxed animate-in fade-in zoom-in-95 duration-200 devforge-wysiwyg"
                dangerouslySetInnerHTML={{
                  __html: isHtmlContent(recallAnswer)
                    ? recallAnswer
                    : markdownToHtml(recallAnswer),
                }}
              />
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]">
                Press <kbd className="px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs">Spacebar</kbd> or Click anywhere on this card to reveal the answer.
              </div>
            )}
          </div>

          <div className="text-xs sm:text-sm text-[var(--muted)] flex items-center justify-between pt-3 border-t border-[var(--border)]/60">
            <span>Tags: {currentNote?.tags.join(' ')}</span>
            <span className="capitalize font-medium">Mastery: {currentNote?.masteryLevel}</span>
          </div>
        </div>
      </div>

      {/* 🎛️ Bottom Rating Buttons (Visible when revealed) */}
      <div className="max-w-2xl mx-auto w-full mt-6">
        {isRevealed ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 animate-in fade-in duration-150">
            {/* Again (<1d) */}
            <button
              onClick={() => handleRate('AGAIN')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 active:scale-95 transition-all group cursor-pointer"
            >
              <span className="text-sm font-bold">1. Again</span>
              <span className="text-xs text-[var(--muted)]">&lt; 1 Day</span>
            </button>

            {/* Hard (2d) */}
            <button
              onClick={() => handleRate('HARD')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 active:scale-95 transition-all group cursor-pointer"
            >
              <span className="text-sm font-bold">2. Hard</span>
              <span className="text-xs text-[var(--muted)]">2 Days</span>
            </button>

            {/* Good (6d) */}
            <button
              onClick={() => handleRate('GOOD')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 active:scale-95 transition-all group cursor-pointer"
            >
              <span className="text-sm font-bold">3. Good</span>
              <span className="text-xs text-[var(--muted)]">6 Days</span>
            </button>

            {/* Easy (16d) */}
            <button
              onClick={() => handleRate('EASY')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 active:scale-95 transition-all group cursor-pointer"
            >
              <span className="text-sm font-bold">4. Easy</span>
              <span className="text-xs text-[var(--muted)]">16 Days</span>
            </button>
          </div>
        ) : (
          <div className="text-center text-sm text-[var(--muted)]">
            Review your recall before rating your confidence.
          </div>
        )}
      </div>
    </div>
  );
}
