import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';

export type WorkoutStreaks = Readonly<{
  currentStreakDays: number;
  longestStreakDays: number;
  activeDates: string[];
}>;

function toMidnight(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(0, 0, 0, 0);
  return next;
}

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getPreviousDateString(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return isoDate(date);
}

export function calculateWorkoutStreaks(
  entries: readonly WorkoutEntry[],
  now: Date = new Date(),
): WorkoutStreaks {
  const uniqueDates = Array.from(new Set(entries.map(entry => entry.date))).sort();

  if (uniqueDates.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      activeDates: [],
    };
  }

  let longest = 1;
  let running = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = uniqueDates[index - 1];
    const current = uniqueDates[index];

    if (getPreviousDateString(current) === previous) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  const today = isoDate(toMidnight(now));
  const yesterday = getPreviousDateString(today);

  let currentStreakDays = 0;

  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    let cursor = uniqueDates.includes(today) ? today : yesterday;

    while (uniqueDates.includes(cursor)) {
      currentStreakDays += 1;
      cursor = getPreviousDateString(cursor);
    }
  }

  return {
    currentStreakDays,
    longestStreakDays: longest,
    activeDates: uniqueDates,
  };
}