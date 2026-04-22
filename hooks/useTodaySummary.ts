import { useMemo } from 'react';

import type { TodaySummary, WorkoutEntry } from '@/types/common';
import { startOfDayIso } from '@/utils/date/startOfDay';
import { roundToDecimals } from '@/utils/number/round';

type UseTodaySummaryOptions = Readonly<{
  entries?: readonly WorkoutEntry[];
  now?: Date;
}>;

type UseTodaySummaryResult = Readonly<{
  summary: TodaySummary;
  entriesForToday: WorkoutEntry[];
}>;

function createEmptySummary(date: string): TodaySummary {
  return {
    date,
    totalWorkouts: 0,
    totalDurationSeconds: 0,
    totalCalories: 0,
    totalDistanceKm: 0,
  };
}

export function useTodaySummary(
  options: UseTodaySummaryOptions = {},
): UseTodaySummaryResult {
  const { entries = [], now = new Date() } = options;

  return useMemo(() => {
    const todayKey = startOfDayIso(now) ?? '';
    const entriesForToday = entries.filter(entry => {
      const entryDay = startOfDayIso(entry.loggedAt);
      return entryDay === todayKey;
    });

    const summary = entriesForToday.reduce<TodaySummary>((accumulator, entry) => {
      return {
        date: accumulator.date,
        totalWorkouts: accumulator.totalWorkouts + 1,
        totalDurationSeconds:
          accumulator.totalDurationSeconds + (entry.durationSeconds ?? 0),
        totalCalories: accumulator.totalCalories + (entry.calories ?? 0),
        totalDistanceKm: roundToDecimals(
          accumulator.totalDistanceKm + (entry.distanceKm ?? 0),
          2,
        ),
      };
    }, createEmptySummary(todayKey));

    return {
      summary,
      entriesForToday,
    };
  }, [entries, now]);
}