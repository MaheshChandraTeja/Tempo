import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { calculateWorkoutStreaks, type WorkoutStreaks } from '@/modules/analytics/streaks';
import {
    aggregateWorkouts,
    aggregateWorkoutsByDate,
    filterWorkoutsByDateRange,
    type WorkoutAggregate,
    type WorkoutDayAggregate,
} from '@/modules/analytics/workoutAggregation';
import { estimateWorkoutCalories } from '@/modules/nutrition/calorieEstimation';
import { roundToDecimals } from '@/utils/number/round';

export type WeeklyCalorieTrendPoint = Readonly<{
  date: string;
  caloriesKcal: number;
}>;

export type LocalAnalyticsSnapshot = Readonly<{
  totals: WorkoutAggregate;
  streaks: WorkoutStreaks;
  byDay: WorkoutDayAggregate[];
  estimatedCaloriesKcal: number;
  weeklyCalories: WeeklyCalorieTrendPoint[];
}>;

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(0, 0, 0, 0);
  return next;
}

function buildRecentDateRange(now: Date, days: number): { startDate: string; endDate: string } {
  const end = startOfDay(now);
  const start = new Date(end.getTime());
  start.setDate(end.getDate() - (days - 1));

  return {
    startDate: isoDate(start),
    endDate: isoDate(end),
  };
}

function buildWeeklyCalories(
  entries: readonly WorkoutEntry[],
  now: Date,
  days = 7,
): WeeklyCalorieTrendPoint[] {
  const range = buildRecentDateRange(now, days);
  const inRange = filterWorkoutsByDateRange(entries, range);
  const byDay = aggregateWorkoutsByDate(inRange);

  const dayMap = new Map(byDay.map(item => [item.date, item.totalCaloriesKcal]));
  const points: WeeklyCalorieTrendPoint[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date(startOfDay(now).getTime());
    date.setDate(date.getDate() - (days - 1 - index));

    const key = isoDate(date);

    points.push({
      date: key,
      caloriesKcal: dayMap.get(key) ?? 0,
    });
  }

  return points;
}

export type LocalAnalyticsService = Readonly<{
  buildSnapshot: (entries: readonly WorkoutEntry[], now?: Date) => LocalAnalyticsSnapshot;
}>;

export function createLocalAnalyticsService(): LocalAnalyticsService {
  return Object.freeze({
    buildSnapshot(entries: readonly WorkoutEntry[], now: Date = new Date()): LocalAnalyticsSnapshot {
      const totals = aggregateWorkouts(entries);
      const byDay = aggregateWorkoutsByDate(entries);
      const streaks = calculateWorkoutStreaks(entries, now);

      const estimatedCaloriesKcal = roundToDecimals(
        entries.reduce((sum, entry) => {
          return sum + estimateWorkoutCalories(entry).estimatedCaloriesKcal;
        }, 0),
        0,
      );

      const weeklyCalories = buildWeeklyCalories(entries, now, 7);

      return {
        totals,
        streaks,
        byDay,
        estimatedCaloriesKcal,
        weeklyCalories,
      };
    },
  });
}

let analyticsServiceSingleton: LocalAnalyticsService | null = null;

export function getLocalAnalyticsService(): LocalAnalyticsService {
  if (!analyticsServiceSingleton) {
    analyticsServiceSingleton = createLocalAnalyticsService();
  }

  return analyticsServiceSingleton;
}