import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { getLocalAnalyticsService } from '@/modules/analytics/localAnalytics.service';
import { formatDate } from '@/utils/date/formatDate';

export type WeeklyTrendPoint = Readonly<{
  date: string;
  label: string;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  totalWorkouts: number;
}>;

export type WeeklyTrendSummary = Readonly<{
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  totalWorkouts: number;
  currentStreakDays: number;
  longestStreakDays: number;
}>;

export type WeeklyTrendViewModel = Readonly<{
  points: WeeklyTrendPoint[];
  summary: WeeklyTrendSummary;
}>;

export function selectWeeklyTrends(
  entries: readonly WorkoutEntry[],
  now: Date = new Date(),
): WeeklyTrendViewModel {
  const analytics = getLocalAnalyticsService().buildSnapshot(entries, now);

  const points: WeeklyTrendPoint[] = analytics.weeklyCalories.map(point => {
    const day = analytics.byDay.find(item => item.date === point.date);

    return {
      date: point.date,
      label: formatDate(point.date, { preset: 'weekday-short' }),
      totalCaloriesKcal: point.caloriesKcal,
      totalDurationSeconds: day?.totalDurationSeconds ?? 0,
      totalDistanceKm: day?.totalDistanceKm ?? 0,
      totalWorkouts: day?.totalWorkouts ?? 0,
    };
  });

  return {
    points,
    summary: {
      totalCaloriesKcal: analytics.totals.totalCaloriesKcal,
      totalDurationSeconds: analytics.totals.totalDurationSeconds,
      totalDistanceKm: analytics.totals.totalDistanceKm,
      totalWorkouts: analytics.totals.totalWorkouts,
      currentStreakDays: analytics.streaks.currentStreakDays,
      longestStreakDays: analytics.streaks.longestStreakDays,
    },
  };
}