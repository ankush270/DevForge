import { ReviewRating, SRSItem, MasteryLevel } from '@/types';

/**
 * SuperMemo SM-2 Spaced Repetition calculation
 */
export function calculateNextSRS(
  rating: ReviewRating,
  prevItem?: Partial<SRSItem>
): {
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewAt: string;
} {
  const prevInterval = prevItem?.intervalDays ?? 1;
  const prevRepetition = prevItem?.repetitionCount ?? 0;
  const prevEaseFactor = prevItem?.easeFactor ?? 2.5;

  let interval = prevInterval;
  let repetition = prevRepetition;
  let easeFactor = prevEaseFactor;

  if (rating === 'AGAIN') {
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Quality mapping: EASY = 5, GOOD = 4, HARD = 3
    const quality = rating === 'EASY' ? 5 : rating === 'GOOD' ? 4 : 3;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = rating === 'HARD' ? 2 : 6;
    } else {
      const multiplier = rating === 'HARD' ? 1.2 : rating === 'EASY' ? easeFactor * 1.3 : easeFactor;
      interval = Math.round(prevInterval * multiplier);
    }
    repetition += 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    intervalDays: interval,
    repetitionCount: repetition,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    nextReviewAt: nextReviewDate.toISOString(),
  };
}

/**
 * Calculates decay status based on last reviewed date vs interval
 */
export function calculateMasteryDecay(
  lastReviewedAt: string | null,
  intervalDays: number
): MasteryLevel {
  if (!lastReviewedAt) return 'YELLOW';

  const lastDate = new Date(lastReviewedAt).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= intervalDays) {
    return 'GREEN';
  } else if (diffDays <= intervalDays + 14) {
    return 'YELLOW';
  } else {
    return 'RED'; // Critical decay!
  }
}
