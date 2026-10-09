'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Subject, Topic, Note, ReviewLog, ReviewRating, ActiveView } from '@/types';
import {
  INITIAL_SUBJECTS,
  loadSubjectsFromStorage,
  saveSubjectsToStorage,
  loadReviewLogsFromStorage,
  saveReviewLogsToStorage,
  DUMMY_SUBJECT_IDS,
} from '@/lib/storage';
import { calculateNextSRS, calculateMasteryDecay } from '@/lib/srs';
import {
  checkSupabaseHealth,
  pushToCloud,
  pullFromCloud,
  CloudHealth,
} from '@/lib/cloudSync';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import JSZip from 'jszip';

export type CloudSyncStatus = 'synced' | 'syncing' | 'needs_setup' | 'offline' | 'error';

interface AppContextType {
  subjects: Subject[];
  reviewLogs: ReviewLog[];
  activeView: ActiveView;
  selectedNote: Note | null;
  selectedSubjectId: string | null;
  selectedTopicId: string | null;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  isQuickCaptureOpen: boolean;
  isSprintModalOpen: boolean;
  isSettingsOpen: boolean;
  filterTag: string | null;
  dailyReviewCap: number;
  streak: number;
  dueNotesQueue: Note[];
  masteredCount: number;
  totalNotesCount: number;
  isHydrated: boolean;

  // Supabase Cloud Sync
  cloudStatus: CloudSyncStatus;
  cloudHealth: CloudHealth;
  isCloudSyncModalOpen: boolean;
  lastSyncedAt: Date | null;
  setIsCloudSyncModalOpen: (open: boolean) => void;
  checkAndSyncCloud: () => Promise<CloudHealth>;
  forcePushToCloud: () => Promise<boolean>;
  forcePullFromCloud: () => Promise<boolean>;

  // Actions
  setActiveView: (view: ActiveView) => void;
  setSelectedNote: (note: Note | null) => void;
  setSelectedSubjectId: (id: string | null) => void;
  setSelectedTopicId: (id: string | null) => void;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsQuickCaptureOpen: (open: boolean) => void;
  setIsSprintModalOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setFilterTag: (tag: string | null) => void;
  setDailyReviewCap: (cap: number) => void;

  // CRUD
  addSubject: (title: string, icon?: string, color?: string) => Subject;
  updateSubject: (subjectId: string, updates: Partial<Omit<Subject, 'id' | 'topics'>>) => void;
  deleteSubject: (subjectId: string) => void;
  addTopic: (subjectId: string, title: string) => Topic;
  addNote: (topicId: string, title: string, content?: string, tags?: string[], isDsa?: boolean) => Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  openNote: (noteId: string) => void;
  recordReview: (noteId: string, rating: ReviewRating, timeSpentSeconds: number) => void;
  startRevisionQueue: (filterTag?: string) => void;

  // Export / Backup
  exportNotesToZip: () => Promise<void>;
  exportDataAsJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, canEditNote, canEditSubject, requireAuth } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [dailyReviewCap, setDailyReviewCapState] = useState(15);
  const [isHydrated, setIsHydrated] = useState(false);

  // Supabase Cloud Sync State
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('offline');
  const [cloudHealth, setCloudHealth] = useState<CloudHealth>({
    isConfigured: false,
    isConnected: false,
    hasTables: false,
  });
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Initialize and run Auto-Decay Scanner on boot
  useEffect(() => {
    const loadedSubs = loadSubjectsFromStorage();
    const loadedLogs = loadReviewLogsFromStorage();
    const savedCap = localStorage.getItem('interview_os_cap');
    if (savedCap) setDailyReviewCapState(parseInt(savedCap, 10));

    // Dynamic Auto-Decay Scanner
    const scannedSubs = loadedSubs.map((sub) => ({
      ...sub,
      topics: sub.topics.map((top) => ({
        ...top,
        notes: top.notes.map((note) => {
          if (note.srsItem) {
            const calculatedMastery = calculateMasteryDecay(
              note.srsItem.lastReviewedAt,
              note.srsItem.intervalDays
            );
            return {
              ...note,
              masteryLevel: calculatedMastery,
            };
          }
          return note;
        }),
      })),
    }));

    setSubjects(scannedSubs);
    setReviewLogs(loadedLogs);
    setIsHydrated(true);
  }, []);

  const setDailyReviewCap = (cap: number) => {
    setDailyReviewCapState(cap);
    localStorage.setItem('interview_os_cap', cap.toString());
  };

  // Sync to local storage on state change
  useEffect(() => {
    if (isHydrated) {
      saveSubjectsToStorage(subjects);
    }
  }, [subjects, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveReviewLogsToStorage(reviewLogs);
    }
  }, [reviewLogs, isHydrated]);

  // Cloud Sync Functions
  const checkAndSyncCloud = async (): Promise<CloudHealth> => {
    const health = await checkSupabaseHealth();
    setCloudHealth(health);

    if (!health.isConfigured || !health.isConnected) {
      setCloudStatus('offline');
    } else if (!health.hasTables) {
      setCloudStatus('needs_setup');
    } else {
      // Tables are verified in Supabase!
      const cloudRes = await pullFromCloud(user?.id);
      if (cloudRes.success && cloudRes.data && cloudRes.data.subjects && cloudRes.data.subjects.length > 0) {
        const cleanCloudSubs = cloudRes.data.subjects.filter((s: Subject) => !DUMMY_SUBJECT_IDS.has(s.id));
        setSubjects(cleanCloudSubs);
        setReviewLogs(cloudRes.data.reviewLogs || []);
        saveSubjectsToStorage(cleanCloudSubs);
        saveReviewLogsToStorage(cloudRes.data.reviewLogs || []);
        setLastSyncedAt(new Date());
        setCloudStatus('synced');

        // If cloud had old dummy subjects, immediately sync the cleaned version back
        if (cleanCloudSubs.length !== cloudRes.data.subjects.length) {
          pushToCloud(cleanCloudSubs, cloudRes.data.reviewLogs || [], user?.id);
        }
      } else {
        // Cloud is fresh or empty, push existing local notes
        await pushToCloud(subjects, reviewLogs, user?.id);
        setLastSyncedAt(new Date());
        setCloudStatus('synced');
      }
    }
    return health;
  };

  const forcePushToCloud = async (): Promise<boolean> => {
    setCloudStatus('syncing');
    const res = await pushToCloud(subjects, reviewLogs, user?.id);
    if (res.success) {
      setCloudStatus('synced');
      setLastSyncedAt(new Date());
      return true;
    } else {
      setCloudStatus('error');
      return false;
    }
  };

  const forcePullFromCloud = async (): Promise<boolean> => {
    setCloudStatus('syncing');
    const res = await pullFromCloud(user?.id);
    if (res.success && res.data) {
      setSubjects(res.data.subjects);
      setReviewLogs(res.data.reviewLogs);
      saveSubjectsToStorage(res.data.subjects);
      saveReviewLogsToStorage(res.data.reviewLogs);
      setCloudStatus('synced');
      setLastSyncedAt(new Date());
      return true;
    } else {
      setCloudStatus('error');
      return false;
    }
  };

  // Initial cloud check after local hydration or user auth change
  useEffect(() => {
    if (isHydrated) {
      checkAndSyncCloud();
    }
  }, [isHydrated, user?.id]);

  // Debounced Auto-Sync to Supabase on edits
  useEffect(() => {
    if (!isHydrated || !cloudHealth.hasTables) return;

    setCloudStatus('syncing');
    const timer = setTimeout(async () => {
      const res = await pushToCloud(subjects, reviewLogs, user?.id);
      if (res.success) {
        setCloudStatus('synced');
        setLastSyncedAt(new Date());
      } else {
        setCloudStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [subjects, reviewLogs, isHydrated, cloudHealth.hasTables, user?.id]);

  // Realtime Supabase Channel Listener for Multi-Device Sync
  useEffect(() => {
    if (!cloudHealth.hasTables || !supabase) return;

    const channel = supabase
      .channel('public:interview_os_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interview_os_state' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'subjects' in payload.new) {
            const newSubjects = (payload.new as { subjects: Subject[] }).subjects;
            const newLogs = (payload.new as { review_logs: ReviewLog[] }).review_logs || [];
            if (Array.isArray(newSubjects)) {
              setSubjects(newSubjects);
              setReviewLogs(newLogs);
              saveSubjectsToStorage(newSubjects);
              saveReviewLogsToStorage(newLogs);
              setLastSyncedAt(new Date());
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [cloudHealth.hasTables]);

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+N, Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsQuickCaptureOpen(false);
        setIsSprintModalOpen(false);
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute all notes flat array
  const allNotes = useMemo(() => {
    const list: Note[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => list.push(n));
      });
    });
    return list;
  }, [subjects]);

  const selectedNote = useMemo(() => {
    return allNotes.find((n) => n.id === selectedNoteId) || null;
  }, [allNotes, selectedNoteId]);

  // Calculate Due Notes Queue (with Hydration Guard & Daily Cap)
  const dueNotesQueue = useMemo(() => {
    if (!isHydrated) return [];
    const now = Date.now();

    let due = allNotes.filter((note) => {
      if (filterTag && !note.tags.includes(filterTag)) return false;
      if (!note.srsItem) return true;
      return new Date(note.srsItem.nextReviewAt).getTime() <= now;
    });

    due.sort((a, b) => {
      if (a.masteryLevel === 'RED' && b.masteryLevel !== 'RED') return -1;
      if (b.masteryLevel === 'RED' && a.masteryLevel !== 'RED') return 1;
      const timeA = a.srsItem ? new Date(a.srsItem.nextReviewAt).getTime() : 0;
      const timeB = b.srsItem ? new Date(b.srsItem.nextReviewAt).getTime() : 0;
      return timeA - timeB;
    });

    return due.slice(0, dailyReviewCap);
  }, [allNotes, filterTag, dailyReviewCap, isHydrated]);

  const masteredCount = useMemo(() => {
    return allNotes.filter((n) => n.masteryLevel === 'GREEN').length;
  }, [allNotes]);

  const totalNotesCount = allNotes.length;

  // Streak Calculation
  const streak = useMemo(() => {
    if (!isHydrated || reviewLogs.length === 0) return 0;
    const dates = Array.from(
      new Set(
        reviewLogs.map((log) => new Date(log.reviewedAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    if (dates.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let checkDate = dates.includes(today) ? today : dates.includes(yesterday) ? yesterday : null;
    if (!checkDate) return 0;

    let datePtr = new Date(checkDate);
    while (true) {
      const dateStr = datePtr.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        currentStreak++;
        datePtr.setDate(datePtr.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [reviewLogs, isHydrated]);

  const openNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setActiveView('editor');

    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({
          ...t,
          notes: t.notes.map((n) =>
            n.id === noteId ? { ...n, lastOpenedAt: new Date().toISOString() } : n
          ),
        })),
      }))
    );
  };

  const addSubject = (title: string, icon = 'Cpu', color = 'indigo'): Subject => {
    if (!requireAuth('create a subject')) {
      return {
        id: `sub-${Date.now()}`,
        title,
        icon,
        color,
        orderIndex: subjects.length,
        topics: [],
        userId: user?.id,
        authorEmail: user?.email,
      };
    }

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      title,
      icon,
      color,
      orderIndex: subjects.length,
      topics: [],
      userId: user?.id,
      authorEmail: user?.email,
    };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  const updateSubject = (
    subjectId: string,
    updates: Partial<Omit<Subject, 'id' | 'topics'>>
  ) => {
    const targetSubject = subjects.find((s) => s.id === subjectId);
    if (targetSubject && !canEditSubject(targetSubject)) {
      requireAuth('edit this subject');
      return;
    }

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          ...updates,
        };
      })
    );
  };

  const deleteSubject = (subjectId: string) => {
    const targetSubject = subjects.find((s) => s.id === subjectId);
    if (targetSubject && !canEditSubject(targetSubject)) {
      requireAuth('delete this subject');
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
    }
  };

  const addTopic = (subjectId: string, title: string): Topic => {
    const targetSubject = subjects.find((s) => s.id === subjectId);
    if (targetSubject && !canEditSubject(targetSubject)) {
      requireAuth('add topics to this subject');
      return { id: `top-${Date.now()}`, subjectId, title, orderIndex: 0, notes: [] };
    }
    if (!requireAuth('add topics')) {
      return { id: `top-${Date.now()}`, subjectId, title, orderIndex: 0, notes: [] };
    }

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      subjectId,
      title,
      orderIndex: 0,
      notes: [],
    };
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: [...s.topics, newTopic],
        };
      })
    );
    return newTopic;
  };

  const addNote = (
    topicId: string,
    title: string,
    content = '',
    tags: string[] = [],
    isDsa = false
  ): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      topicId,
      title,
      contentMarkdown: content || `# ${title}\n\nStart writing notes here...`,
      masteryLevel: 'YELLOW',
      tags,
      isDsaProblem: isDsa,
      userId: user?.id,
      authorEmail: user?.email,
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now,
      srsItem: {
        id: `srs-${Date.now()}`,
        noteId: `note-${Date.now()}`,
        repetitionCount: 0,
        intervalDays: 1,
        easeFactor: 2.5,
        nextReviewAt: now,
        lastReviewedAt: null,
      },
    };

    if (!requireAuth('create notes')) {
      return newNote;
    }

    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => {
          if (t.id !== topicId) return t;
          return {
            ...t,
            notes: [newNote, ...t.notes],
          };
        }),
      }))
    );

    openNote(newNote.id);
    return newNote;
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    const target = allNotes.find((n) => n.id === noteId);
    if (target && !canEditNote(target)) {
      requireAuth('edit this note');
      return;
    }

    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({
          ...t,
          notes: t.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  ...updates,
                  userId: n.userId || user?.id,
                  authorEmail: n.authorEmail || user?.email,
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),
      }))
    );
  };

  const deleteNote = (noteId: string) => {
    const target = allNotes.find((n) => n.id === noteId);
    if (target && !canEditNote(target)) {
      requireAuth('delete this note');
      return;
    }

    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({
          ...t,
          notes: t.notes.filter((n) => n.id !== noteId),
        })),
      }))
    );
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      setActiveView('dashboard');
    }
  };

  const recordReview = (noteId: string, rating: ReviewRating, timeSpentSeconds: number) => {
    const targetNote = allNotes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const srsUpdate = calculateNextSRS(rating, targetNote.srsItem);
    const newMastery =
      rating === 'AGAIN'
        ? 'RED'
        : rating === 'HARD'
        ? 'YELLOW'
        : 'GREEN';

    const now = new Date().toISOString();

    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({
          ...t,
          notes: t.notes.map((n) => {
            if (n.id !== noteId) return n;
            return {
              ...n,
              masteryLevel: newMastery,
              srsItem: {
                id: n.srsItem?.id || `srs-${Date.now()}`,
                noteId: n.id,
                ...srsUpdate,
                lastReviewedAt: now,
              },
            };
          }),
        })),
      }))
    );

    const newLog: ReviewLog = {
      id: `log-${Date.now()}`,
      noteId,
      rating,
      timeSpentSeconds,
      reviewedAt: now,
    };
    setReviewLogs((prev) => [...prev, newLog]);
  };

  const startRevisionQueue = (tag?: string) => {
    if (tag) setFilterTag(tag);
    else setFilterTag(null);
    setActiveView('focus-deck');
  };

  // 📦 1-Click Complete Markdown ZIP Export (Obsidian & Notion compatible)
  const exportNotesToZip = async () => {
    const zip = new JSZip();

    subjects.forEach((subject) => {
      const safeSubjectName = subject.title.replace(/[\\/:*?"<>|]/g, '_');
      const subjectFolder = zip.folder(safeSubjectName);

      subject.topics.forEach((topic) => {
        const safeTopicName = topic.title.replace(/[\\/:*?"<>|]/g, '_');
        const topicFolder = subjectFolder?.folder(safeTopicName);

        topic.notes.forEach((note) => {
          const safeNoteName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
          const frontmatter = `---
title: "${note.title}"
subject: "${subject.title}"
topic: "${topic.title}"
mastery: "${note.masteryLevel}"
tags: ${JSON.stringify(note.tags)}
last_opened: "${note.lastOpenedAt}"
created_at: "${note.createdAt}"
is_dsa: ${note.isDsaProblem ?? false}
---

`;
          topicFolder?.file(safeNoteName, frontmatter + (note.contentMarkdown || ''));
        });
      });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview_notes_backup_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Raw JSON Backup
  const exportDataAsJson = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      subjects,
      reviewLogs,
      dailyReviewCap,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview_os_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Raw JSON Backup
  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.subjects && Array.isArray(parsed.subjects)) {
        setSubjects(parsed.subjects);
        if (parsed.reviewLogs) setReviewLogs(parsed.reviewLogs);
        if (parsed.dailyReviewCap) setDailyReviewCap(parsed.dailyReviewCap);
        saveSubjectsToStorage(parsed.subjects);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaultData = () => {
    if (confirm('Clear workspace to completely empty state? This will delete all dummy data, notes, and review logs.')) {
      setSubjects([]);
      saveSubjectsToStorage([]);
      setReviewLogs([]);
      saveReviewLogsToStorage([]);
      setSelectedNoteId(null);
      setActiveView('dashboard');
      if (cloudHealth.hasTables) {
        pushToCloud([], []);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        reviewLogs,
        activeView,
        selectedNote,
        selectedSubjectId,
        selectedTopicId,
        isSidebarCollapsed,
        isCommandPaletteOpen,
        isQuickCaptureOpen,
        isSprintModalOpen,
        isSettingsOpen,
        filterTag,
        dailyReviewCap,
        streak,
        dueNotesQueue,
        masteredCount,
        totalNotesCount,
        isHydrated,
        // Supabase Cloud Sync
        cloudStatus,
        cloudHealth,
        isCloudSyncModalOpen,
        lastSyncedAt,
        setIsCloudSyncModalOpen,
        checkAndSyncCloud,
        forcePushToCloud,
        forcePullFromCloud,
        setActiveView,
        setSelectedNote: (note) => setSelectedNoteId(note ? note.id : null),
        setSelectedSubjectId,
        setSelectedTopicId,
        setIsSidebarCollapsed,
        setIsCommandPaletteOpen,
        setIsQuickCaptureOpen,
        setIsSprintModalOpen,
        setIsSettingsOpen,
        setFilterTag,
        setDailyReviewCap,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        addNote,
        updateNote,
        deleteNote,
        openNote,
        recordReview,
        startRevisionQueue,
        exportNotesToZip,
        exportDataAsJson,
        importDataFromJson,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
