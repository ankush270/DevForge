import { Subject, ReviewLog } from '@/types';

// 100% Clean Workspace — Zero dummy subjects, zero fake notes, zero fake logs
export const INITIAL_SUBJECTS: Subject[] = [];

// ZERO fake review logs — all activity starts at 0
export const INITIAL_REVIEW_LOGS: ReviewLog[] = [];

export const DUMMY_SUBJECT_IDS = new Set(['sub-os', 'sub-dbms', 'sub-sys-design', 'sub-dsa']);

const STORAGE_KEY_SUBJECTS = 'interview_os_subjects_v4';
const STORAGE_KEY_LOGS = 'interview_os_logs_v4';

export function loadSubjectsFromStorage(): Subject[] {
  if (typeof window === 'undefined') return INITIAL_SUBJECTS;
  try {
    // Check v4 first, fallback to checking legacy keys to sanitize them
    let raw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
    if (!raw) {
      raw = localStorage.getItem('interview_os_subjects_v3');
    }

    if (!raw) {
      saveSubjectsToStorage(INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    }

    const parsed: Subject[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_SUBJECTS;

    // Filter out dummy/seeded template subjects that user didn't create
    const cleanSubjects = parsed.filter((s) => !DUMMY_SUBJECT_IDS.has(s.id));

    // Save cleaned state to latest v4 key and remove legacy
    saveSubjectsToStorage(cleanSubjects);
    try {
      localStorage.removeItem('interview_os_subjects_v3');
      localStorage.removeItem('interview_os_subjects_v2');
      localStorage.removeItem('interview_os_subjects_v1');
    } catch {
      // ignore
    }

    return cleanSubjects;
  } catch {
    return INITIAL_SUBJECTS;
  }
}

export function saveSubjectsToStorage(subjects: Subject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function loadReviewLogsFromStorage(): ReviewLog[] {
  if (typeof window === 'undefined') return INITIAL_REVIEW_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      saveReviewLogsToStorage(INITIAL_REVIEW_LOGS);
      return INITIAL_REVIEW_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEW_LOGS;
  }
}

export function saveReviewLogsToStorage(logs: ReviewLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to localStorage:', err);
  }
}
