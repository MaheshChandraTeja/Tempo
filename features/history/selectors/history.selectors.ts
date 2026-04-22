import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { formatDate } from '@/utils/date/formatDate';
import { groupByDay } from '@/utils/date/groupByDay';
import { roundToDecimals } from '@/utils/number/round';

export type DaySummary = Readonly<{
  date: string;
  displayDate: string;
  totalWorkouts: number;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
}>;

export type DayWorkoutItem = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  loggedAt: string;
  caloriesKcal: number | null;
  durationSeconds: number | null;
  source: WorkoutEntry['source'];
}>;

export type DayWorkoutGroupViewModel = Readonly<{
  date: string;
  displayDate: string;
  summary: DaySummary;
  workouts: DayWorkoutItem[];
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

function buildDaySummary(date: string, entries: readonly WorkoutEntry[]): DaySummary {
  return entries.reduce<DaySummary>(
    (accumulator, entry) => ({
      ...accumulator,
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
      date,
      displayDate: formatDate(date, { preset: 'display-medium' }),
      totalWorkouts: 0,
      totalCaloriesKcal: 0,
      totalDurationSeconds: 0,
      totalDistanceKm: 0,
    },
  );
}

export function selectHistoryDayGroups(
  entries: readonly WorkoutEntry[],
): DayWorkoutGroupViewModel[] {
  const grouped = groupByDay(entries, {
    getDate: entry => entry.date,
  });

  return Object.entries(grouped)
    .sort(([left], [right]) => {
      return new Date(right).getTime() - new Date(left).getTime();
    })
    .map(([date, dayEntries]) => {
      const sortedEntries = [...dayEntries].sort((left, right) => {
        return new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime();
      });

      return {
        date,
        displayDate: formatDate(date, { preset: 'display-medium' }),
        summary: buildDaySummary(date, sortedEntries),
        workouts: sortedEntries.map(entry => ({
          id: entry.id,
          title: formatWorkoutTitle(entry),
          subtitle: formatWorkoutSubtitle(entry),
          loggedAt: entry.loggedAt,
          caloriesKcal: entry.metrics.caloriesKcal,
          durationSeconds: entry.metrics.durationSeconds,
          source: entry.source,
        })),
      };
    });
}

export function selectDayGroupByDate(
  entries: readonly WorkoutEntry[],
  date: string,
): DayWorkoutGroupViewModel | null {
  return selectHistoryDayGroups(entries).find(group => group.date === date) ?? null;
}

export function selectHistoryCalendarDays(
  entries: readonly WorkoutEntry[],
): Array<
  Readonly<{
    date: string;
    totalWorkouts: number;
  }>
> {
  return selectHistoryDayGroups(entries).map(group => ({
    date: group.date,
    totalWorkouts: group.summary.totalWorkouts,
  }));
}