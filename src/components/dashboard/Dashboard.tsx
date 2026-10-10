'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
  Layers,
  Plus,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { renderSubjectIcon } from '@/lib/subjectIcons';

export function Dashboard() {
  const { user, openAuthModal } = useAuth();
  const {
    subjects,
    reviewLogs,
    streak,
    dueNotesQueue,
    masteredCount,
    totalNotesCount,
    openNote,
    startRevisionQueue,
    setIsSprintModalOpen,
    setIsQuickCaptureOpen,
  } = useApp();

  // All notes sorted by lastOpenedAt
  const recentlyOpenedNotes = useMemo(() => {
    const list: any[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          list.push({ ...n, subjectTitle: s.title });
        });
      });
    });
    return list
      .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
      .slice(0, 4);
  }, [subjects]);

  // Decay Radar: Notes that are RED or have been neglected longest
  const decayRadarNotes = useMemo(() => {
    const list: any[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          list.push({ ...n, subjectTitle: s.title });
        });
      });
    });
    return list
      .filter((n) => n.masteryLevel === 'RED' || n.masteryLevel === 'YELLOW')
      .sort((a, b) => {
        if (a.masteryLevel === 'RED' && b.masteryLevel !== 'RED') return -1;
        if (b.masteryLevel === 'RED' && a.masteryLevel !== 'RED') return 1;
        return new Date(a.lastOpenedAt).getTime() - new Date(b.lastOpenedAt).getTime();
      })
      .slice(0, 4);
  }, [subjects]);

  // GitHub-style Heatmap Generator (Past 52 weeks = 1 Year) - Tight layout like GitHub
  const [heatmapData, setHeatmapData] = useState<{
    weeks: { date: string; count: number }[][];
    monthLabels: { label: string; index: number }[];
  }>({ weeks: [], monthLabels: [] });

  useEffect(() => {
    const counts: Record<string, number> = {};
    reviewLogs.forEach((log) => {
      const d = new Date(log.reviewedAt).toISOString().split('T')[0];
      counts[d] = (counts[d] || 0) + 1;
    });

    const weeks: { date: string; count: number }[][] = [];
    const monthLabels: { label: string; index: number }[] = [];
    const today = new Date();
    let lastMonth = -1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 52 weeks = 364 days
    for (let w = 51; w >= 0; w--) {
      const week: { date: string; count: number }[] = [];
      const colIndex = 51 - w;

      for (let d = 0; d < 7; d++) {
        const target = new Date(today);
        target.setDate(target.getDate() - (w * 7 + (6 - d)));
        const key = target.toISOString().split('T')[0];

        // Track month label on the first day of the week
        if (d === 0) {
          const m = target.getMonth();
          if (m !== lastMonth) {
            monthLabels.push({ label: monthNames[m], index: colIndex });
            lastMonth = m;
          }
        }

        week.push({
          date: key,
          count: counts[key] || 0,
        });
      }
      weeks.push(week);
    }
    setHeatmapData({ weeks, monthLabels });
  }, [reviewLogs]);

  const masteryPercent = totalNotesCount > 0 ? Math.round((masteredCount / totalNotesCount) * 100) : 0;

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* 🚀 Hero Banner: Action-First Mission Control */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-indigo-950/20 p-6 sm:p-7 md:p-9 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span>
                  {streak > 0 ? `${streak}-Day Revision Streak 🔥` : '0-Day Revision Streak (Complete today’s review to ignite! 🔥)'}
                </span>
              </div>

              {user ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Logged in: <strong>{user.name || user.email}</strong></span>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer border border-black shadow-xs active:translate-y-0.5"
                  title="Click to sign in"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {totalNotesCount > 0 ? 'Welcome back, Engineer.' : 'Welcome to InterviewOS.'}
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl leading-relaxed">
              {totalNotesCount > 0 ? (
                <>
                  You have <strong className="text-emerald-400 font-semibold">{masteredCount} of {totalNotesCount} topics</strong> in active mastery ({masteryPercent}%).
                  {dueNotesQueue.length > 0
                    ? ` ${dueNotesQueue.length} topics require your review today to prevent memory decay.`
                    : ' All scheduled revision targets cleared for today!'}
                </>
              ) : (
                <>
                  Your knowledge vault is ready. Add notes in OS, DBMS, System Design, or DSA to begin tracking your spaced-repetition revision schedule.
                </>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[2px_2px_0px_0px_#000] border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            {totalNotesCount === 0 ? (
              <button
                onClick={() => setIsQuickCaptureOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Note (Ctrl+N)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSprintModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] shadow-sm transition-all cursor-pointer"
                >
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>Interview Sprint</span>
                </button>

                <button
                  onClick={() => startRevisionQueue()}
                  disabled={dueNotesQueue.length === 0}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${
                    dueNotesQueue.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {dueNotesQueue.length > 0
                      ? `Start Today's Revision (${dueNotesQueue.length} Due)`
                      : 'All Caught Up! 🎉'}
                  </span>
                  {dueNotesQueue.length > 0 && <ArrowRight className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 🟩 Activity Habit Center: GitHub-Style Heatmap */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Daily Study & Revision Activity
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-[var(--muted)]">
            {reviewLogs.length === 0
              ? '0 revisions completed (Activity will appear here as you review)'
              : `${reviewLogs.length} total revisions completed`}
          </span>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2 pt-1">
          {heatmapData.weeks.length === 0 ? (
            <div className="h-28 flex items-center justify-center text-sm text-[var(--muted)]">
              Activity heatmap ready...
            </div>
          ) : (
            <div className="inline-flex flex-col gap-1 min-w-max">
              {/* Month Header Row */}
              <div className="relative h-4 text-xs text-[var(--muted)] font-mono pl-8 select-none">
                {heatmapData.monthLabels.map((m, idx) => (
                  <span
                    key={idx}
                    className="absolute font-medium"
                    style={{ left: `${32 + m.index * 16}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Day Labels + Week Columns */}
              <div className="flex items-start gap-1.5">
                {/* Day Labels on Left */}
                <div className="flex flex-col gap-1 text-xs text-[var(--muted)] font-mono select-none pt-0.5 w-8">
                  <span className="h-3 leading-3">Mon</span>
                  <span className="h-3 leading-3 opacity-0">Tue</span>
                  <span className="h-3 leading-3">Wed</span>
                  <span className="h-3 leading-3 opacity-0">Thu</span>
                  <span className="h-3 leading-3">Fri</span>
                  <span className="h-3 leading-3 opacity-0">Sat</span>
                  <span className="h-3 leading-3 opacity-0">Sun</span>
                </div>

                {/* Tightly-packed Heatmap Columns (gap-1, exactly like GitHub!) */}
                <div className="flex gap-1">
                  {heatmapData.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => {
                        let bgClass = 'bg-[var(--surface-hover)] border border-[var(--border)]/50';
                        if (day.count === 1) bgClass = 'bg-emerald-500/40 border border-emerald-500/50';
                        else if (day.count === 2) bgClass = 'bg-emerald-500/70 border border-emerald-500/80';
                        else if (day.count >= 3) bgClass = 'bg-emerald-500 border border-emerald-400';

                        return (
                          <div
                            key={dIdx}
                            className={`w-3 h-3 rounded-xs ${bgClass} transition-colors cursor-pointer hover:ring-1 hover:ring-emerald-400`}
                            title={`${day.date}: ${day.count} revisions`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]/60">
          <span>Past 12 months history</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-[var(--surface-hover)] border border-[var(--border)]/50" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/40 border border-emerald-500/50" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/70 border border-emerald-500/80" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* 🕒 Dual Widget: Continue Reading + Decay Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Continue Where You Left Off */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Continue Where You Left Off
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {recentlyOpenedNotes.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl space-y-2">
                <BookOpen className="w-7 h-7 text-[var(--muted)] mx-auto opacity-40" />
                <p className="font-semibold text-[var(--foreground)]">No notes opened yet</p>
                <p className="text-xs text-[var(--muted)]">Create a note using the sidebar or press Ctrl+N.</p>
              </div>
            ) : (
              recentlyOpenedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openNote(note.id)}
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-pointer group transition-all"
                >
                  <div className="truncate pr-3">
                    <h4 className="text-sm sm:text-base font-semibold text-[var(--foreground)] group-hover:text-indigo-400 truncate">
                      {note.title}
                    </h4>
                    <span className="text-xs text-[var(--muted)] font-medium">{note.subjectTitle}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        note.masteryLevel === 'GREEN'
                          ? 'bg-emerald-500'
                          : note.masteryLevel === 'YELLOW'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ⚠️ Decay Radar (Needs Attention) */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Decay Radar (At Risk 🔴/🟡)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              SM-2 Priority
            </span>
          </div>

          <div className="space-y-2">
            {totalNotesCount === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl space-y-2">
                <AlertTriangle className="w-7 h-7 text-[var(--muted)] mx-auto opacity-40" />
                <p className="font-semibold text-[var(--foreground)]">No notes to monitor</p>
                <p className="text-xs text-[var(--muted)]">Add notes to track memory retention and SM-2 decay.</p>
              </div>
            ) : decayRadarNotes.length === 0 ? (
              <div className="p-6 text-center text-sm text-emerald-400 font-semibold">
                No decayed concepts! You are in peak memory retention.
              </div>
            ) : (
              decayRadarNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openNote(note.id)}
                  className="flex items-center justify-between p-3 rounded-lg border border-rose-500/15 hover:border-rose-500/35 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer group transition-all"
                >
                  <div className="truncate pr-3">
                    <h4 className="text-sm sm:text-base font-semibold text-[var(--foreground)] group-hover:text-rose-300 truncate">
                      {note.title}
                    </h4>
                    <span className="text-xs text-[var(--muted)] font-medium">{note.subjectTitle}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      Decaying
                    </span>
                    <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📚 Subject Mastery Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          Subject Mastery Progress
        </h3>

        {subjects.length === 0 ? (
          <div className="p-8 text-center text-sm border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]/50 space-y-3">
            <Layers className="w-8 h-8 text-[var(--muted)] mx-auto opacity-50" />
            <h4 className="font-bold text-base text-[var(--foreground)]">No Subjects Created Yet</h4>
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Workspace is completely clean! You can create any subjects you want (like Operating Systems, System Design, DSA, or custom domains) using the sidebar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((subject) => {
              let total = 0;
              let mastered = 0;
              subject.topics.forEach((t) => {
                t.notes.forEach((n) => {
                  total += 1;
                  if (n.masteryLevel === 'GREEN') mastered += 1;
                });
              });
              const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

              return (
                <div
                  key={subject.id}
                  className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/40 transition-all space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {renderSubjectIcon(subject.icon, subject.color, "w-5 h-5")}
                      <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">{subject.title}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-indigo-400">{pct}%</span>
                  </div>

                  <div className="w-full bg-[var(--surface-hover)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--muted)] font-medium">
                    <span>{total} Notes</span>
                    <span className="text-emerald-400 font-semibold">{mastered} Mastered</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
