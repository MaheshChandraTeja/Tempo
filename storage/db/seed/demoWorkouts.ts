import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildWorkout(
  offsetDays: number,
  partial: Partial<WorkoutEntry>,
): WorkoutEntry {
  const now = new Date();
  now.setDate(now.getDate() - offsetDays);

  const loggedAt = new Date(now.getTime());
  loggedAt.setHours(7 + offsetDays, 15, 0, 0);

  const createdAt = new Date(loggedAt.getTime());
  const updatedAt = new Date(loggedAt.getTime());

  return {
    id: `demo_workout_${offsetDays}_${partial.kind ?? 'treadmill'}`,
    date: isoDate(now),
    loggedAt: loggedAt.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    kind: partial.kind ?? 'treadmill',
    source: partial.source ?? 'manual',
    intensity: partial.intensity ?? 'moderate',
    metrics: {
      durationSeconds: partial.metrics?.durationSeconds ?? 1800,
      caloriesKcal: partial.metrics?.caloriesKcal ?? 220,
      distanceKm: partial.metrics?.distanceKm ?? 3.2,
      speedKph: partial.metrics?.speedKph ?? 6.4,
      inclinePercent: partial.metrics?.inclinePercent ?? 1.5,
      averageHeartRateBpm: partial.metrics?.averageHeartRateBpm ?? null,
      steps: partial.metrics?.steps ?? null,
      reps: partial.metrics?.reps ?? null,
      sets: partial.metrics?.sets ?? null,
      weightKg: partial.metrics?.weightKg ?? null,
    },
    notes: {
      title: partial.notes?.title ?? null,
      notes: partial.notes?.notes ?? null,
    },
    isEstimatedCalories: partial.isEstimatedCalories ?? false,
  };
}

export function getDemoWorkouts(): WorkoutEntry[] {
  return [
    buildWorkout(0, {
      kind: 'treadmill',
      source: 'treadmill-scan',
      notes: {
        title: 'Morning Treadmill',
        notes: 'Captured from scan pipeline.',
      },
      metrics: {
        durationSeconds: 1500,
        caloriesKcal: 145,
        distanceKm: 1.5,
        speedKph: 7.2,
        inclinePercent: 2.0,
        averageHeartRateBpm: null,
        steps: null,
        reps: null,
        sets: null,
        weightKg: null,
      },
    }),
    buildWorkout(1, {
      kind: 'outdoor-walk',
      source: 'manual',
      notes: {
        title: 'Evening Walk',
        notes: 'Neighborhood loop.',
      },
      metrics: {
        durationSeconds: 2700,
        caloriesKcal: 210,
        distanceKm: 3.8,
        speedKph: 5.1,
        inclinePercent: 0,
        averageHeartRateBpm: null,
        steps: null,
        reps: null,
        sets: null,
        weightKg: null,
      },
    }),
    buildWorkout(2, {
      kind: 'cycling',
      source: 'manual',
      notes: {
        title: 'Cycle Session',
        notes: 'Light recovery ride.',
      },
      metrics: {
        durationSeconds: 2400,
        caloriesKcal: 260,
        distanceKm: 8.1,
        speedKph: 12.2,
        inclinePercent: 0,
        averageHeartRateBpm: null,
        steps: null,
        reps: null,
        sets: null,
        weightKg: null,
      },
    }),
  ];
}