export type MasteryLevel = 'RED' | 'YELLOW' | 'GREEN';
export type ReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface RecallQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface SRSItem {
  id: string;
  noteId: string;
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string; // ISO string
  lastReviewedAt: string | null; // ISO string
}

export interface ReviewLog {
  id: string;
  noteId: string;
  rating: ReviewRating;
  timeSpentSeconds: number;
  reviewedAt: string; // ISO string
}

export interface NoteMode {
  id: string; // e.g. 'depth', 'tricks', 'interview', 'code', or custom id
  name: string; // e.g. 'In-Depth', 'Quick Tricks', 'Interview Q&A'
  icon?: string; // e.g. 'BookOpen', 'Zap', 'Target', 'Code', 'Lightbulb', 'Shield', 'Flame'
  contentMarkdown: string;
}

export interface Note {
  id: string;
  topicId: string;
  title: string;
  contentMarkdown: string;
  modes?: NoteMode[];
  activeModeId?: string;
  activeRecallData?: RecallQuestion[];
  masteryLevel: MasteryLevel;
  tags: string[];
  isDsaProblem?: boolean;
  timeComplexity?: string;
  spaceComplexity?: string;
  problemUrl?: string;
  lastOpenedAt: string;
  createdAt: string;
  updatedAt: string;
  srsItem?: SRSItem;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  orderIndex: number;
  notes: Note[];
}

export interface Subject {
  id: string;
  title: string;
  icon: string; // Lucide icon name, e.g. "Cpu", "Database", "Network", "Binary"
  color: string; // Tailwind color, e.g. "indigo", "emerald", "amber", "cyan"
  orderIndex: number;
  topics: Topic[];
}

export type ActiveView = 'dashboard' | 'editor' | 'focus-deck';
