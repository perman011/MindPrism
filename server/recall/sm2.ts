/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Implementation based on Piotr Wozniak's SuperMemo-2 algorithm.
 * The ease factor is stored as an integer (× 100) to avoid floating-point drift.
 *
 * Quality scale:
 *   0 – complete blackout
 *   1 – incorrect, but remembered once revealed
 *   2 – incorrect, but answer seemed easy to recall
 *   3 – correct with serious difficulty
 *   4 – correct after hesitation
 *   5 – perfect recall
 */

export interface SM2Input {
  /** Current ease factor × 100 (e.g. 250 = 2.5) */
  easeFactor: number;
  /** Current review interval in days */
  intervalDays: number;
  /** Number of consecutive correct reviews */
  repetitions: number;
  /** Self-rated quality 0-5 */
  quality: number;
}

export interface SM2Output {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  /** Next review date (ISO string) */
  nextReviewAt: string;
}

export function computeSM2(input: SM2Input): SM2Output {
  const { easeFactor: ef, intervalDays, repetitions, quality } = input;
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Ease factor adjustment (formula × 100 to keep integer)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = Math.round((0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)) * 100);
  let newEF = ef + efDelta;
  if (newEF < 130) newEF = 130; // minimum 1.3

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    // Failed recall — reset to beginning
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * (newEF / 100));
    }
  }

  // Cap at 365 days (1 year)
  if (newInterval > 365) newInterval = 365;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    easeFactor: newEF,
    intervalDays: newInterval,
    repetitions: newReps,
    nextReviewAt: nextDate.toISOString(),
  };
}
