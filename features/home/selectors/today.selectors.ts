import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { getLocalAnalyticsService } from '@/modules/analytics/localAnalytics.service';
import { startOfDayIso } from '@/utils/date/startOfDay';
import { roundToDecimals } from '@/utils/number/round';

export type TodaySummaryViewModel = Readonly<{
  date: string;
  totalWorkouts: number;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  currentStreakDays: number;
}>;

export type GoalProgressViewModel = Readonly<{
  current: number;
  goal: number;
  ratio: number;
  percentage: number;
  remaining: number;
  isComplete: boolean;
}>;

export type RecentWorkoutItemViewModel = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  loggedAt: string;
  caloriesKcal: number | null;
  durationSeconds: number | null;
  source: WorkoutEntry['source'];
}>;

export type TodayDashboardViewModel = Readonly<{
  summary: TodaySummaryViewModel;
  calorieGoalProgress: GoalProgressViewModel;
  recentWorkouts: RecentWorkoutItemViewModel[];
}>;

type TodaySelectorOptions = Readonly<{
  now?: Date;
  calorieGoalKcal?: number;
  recentLimit?: number;
}>;

function formatWorkoutTitle(entry: WorkoutEntry): string {
  if (entry.notes.title && entry.notes.title.trim().length > 0) {
    return entry.notes.title.trim();
  }

  const label = entry.kind.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatWorkoutSubtitle(entry: WorkoutEntry): string {
  const parts: string[] = [];

  if (entry.metrics.distanceKm != null) {
    parts.push(`${entry.metrics.distanceKm} km`);
  }

  if (entry.metrics.inclinePercent != null) {
    parts.push(`${entry.metrics.inclinePercent}% incline`);
  }

  if (entry.metrics.speedKph != null) {
    parts.push(`${entry.metrics.speedKph} kph`);
  }

  if (parts.length === 0) {
    parts.push(entry.kind.replace(/-/g, ' '));
  }

  return parts.join(' • ');
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

export function selectTodayWorkoutEntries(
  entries: readonly WorkoutEntry[],
  now: Date = new Date(),
): WorkoutEntry[] {
  const todayKey = startOfDayIso(now) ?? '';

  return [...entries]
    .filter(entry => entry.date === todayKey)
    .sort(
      (left, right) =>
        new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime(),
    );
}

export function selectTodaySummary(
  entries: readonly WorkoutEntry[],
  now: Date = new Date(),
): TodaySummaryViewModel {
  const analytics = getLocalAnalyticsService().buildSnapshot(entries, now);
  const todayEntries = selectTodayWorkoutEntries(entries, now);
  const todayKey = startOfDayIso(now) ?? '';

  const todaySummary = todayEntries.reduce<Omit<TodaySummaryViewModel, 'currentStreakDays'>>(
    (accumulator, entry) => ({
      date: todayKey,
      totalWorkouts: accumulator.totalWorkouts + 1,
      totalCaloriesKcal:
        accumulator.totalCaloriesKcal + (entry.metrics.caloriesKcal ?? 0),
      totalDurationSeconds:
        accumulator.totalDurationSeconds + (entry.metrics.durationSeconds ?? 0),
      totalDistanceKm: roundToDecimals(
        accumulator.totalDistanceKm + (entry.metrics.distanceKm ?? 0),
        2,
      ),
    }),
    {
      date: todayKey,
      totalWorkouts: 0,
      totalCaloriesKcal: 0,
      totalDurationSeconds: 0,
      totalDistanceKm: 0,
    },
  );

  return {
    ...todaySummary,
    currentStreakDays: analytics.streaks.currentStreakDays,
  };
}

export function selectCalorieGoalProgress(
  summary: TodaySummaryViewModel,
  calorieGoalKcal = 500,
): GoalProgressViewModel {
  const safeGoal = calorieGoalKcal > 0 ? calorieGoalKcal : 1;
  const ratio = clampRatio(summary.totalCaloriesKcal / safeGoal);
  const percentage = Math.round(ratio * 100);
  const remaining = Math.max(safeGoal - summary.totalCaloriesKcal, 0);

  return {
    current: summary.totalCaloriesKcal,
    goal: safeGoal,
    ratio,
    percentage,
    remaining,
    isComplete: summary.totalCaloriesKcal >= safeGoal,
  };
}

export function selectRecentWorkouts(
  entries: readonly WorkoutEntry[],
  limit = 5,
): RecentWorkoutItemViewModel[] {
  return [...entries]
    .sort(
      (left, right) =>
        new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime(),
    )
    .slice(0, limit)
    .map(entry => ({
      id: entry.id,
      title: formatWorkoutTitle(entry),
      subtitle: formatWorkoutSubtitle(entry),
      loggedAt: entry.loggedAt,
      caloriesKcal: entry.metrics.caloriesKcal,
      durationSeconds: entry.metrics.durationSeconds,
      source: entry.source,
    }));
}

export function selectTodayDashboard(
  entries: readonly WorkoutEntry[],
  options: TodaySelectorOptions = {},
): TodayDashboardViewModel {
  const {
    now = new Date(),
    calorieGoalKcal = 500,
    recentLimit = 5,
  } = options;

  const summary = selectTodaySummary(entries, now);

  return {
    summary,
    calorieGoalProgress: selectCalorieGoalProgress(summary, calorieGoalKcal),
    recentWorkouts: selectRecentWorkouts(entries, recentLimit),
  };
}