import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { roundToDecimals } from '@/utils/number/round';

export type WorkoutAggregate = Readonly<{
  totalWorkouts: number;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  averageCaloriesPerWorkout: number;
  averageDurationSeconds: number;
}>;

export type WorkoutDayAggregate = WorkoutAggregate &
  Readonly<{
    date: string;
  }>;

function createEmptyAggregate(): WorkoutAggregate {
  return {
    totalWorkouts: 0,
    totalCaloriesKcal: 0,
    totalDurationSeconds: 0,
    totalDistanceKm: 0,
    averageCaloriesPerWorkout: 0,
    averageDurationSeconds: 0,
  };
}

export function aggregateWorkouts(
  entries: readonly WorkoutEntry[],
): WorkoutAggregate {
  const base = entries.reduce<WorkoutAggregate>((accumulator, entry) => {
    return {
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
    };
  }, createEmptyAggregate());

  if (base.totalWorkouts === 0) {
    return base;
  }

  return {
    ...base,
    averageCaloriesPerWorkout: roundToDecimals(
      base.totalCaloriesKcal / base.totalWorkouts,
      2,
    ),
    averageDurationSeconds: roundToDecimals(
      base.totalDurationSeconds / base.totalWorkouts,
      0,
    ),
  };
}

export function groupWorkoutsByDate(
  entries: readonly WorkoutEntry[],
): Record<string, WorkoutEntry[]> {
  return entries.reduce<Record<string, WorkoutEntry[]>>((accumulator, entry) => {
    if (!accumulator[entry.date]) {
      accumulator[entry.date] = [];
    }

    accumulator[entry.date].push(entry);
    return accumulator;
  }, {});
}

export function aggregateWorkoutsByDate(
  entries: readonly WorkoutEntry[],
): WorkoutDayAggregate[] {
  const grouped = groupWorkoutsByDate(entries);

  return Object.entries(grouped)
    .map(([date, dayEntries]) => ({
      date,
      ...aggregateWorkouts(dayEntries),
    }))
    .sort((left, right) => {
      return new Date(right.date).getTime() - new Date(left.date).getTime();
    });
}

export function filterWorkoutsByDateRange(
  entries: readonly WorkoutEntry[],
  options: Readonly<{
    startDate?: string;
    endDate?: string;
  }>,
): WorkoutEntry[] {
  const { startDate, endDate } = options;

  return entries.filter(entry => {
    if (startDate && entry.date < startDate) {
      return false;
    }

    if (endDate && entry.date > endDate) {
      return false;
    }

    return true;
  });
}