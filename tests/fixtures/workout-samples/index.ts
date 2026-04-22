import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';

function buildWorkout(
  index: number,
  overrides: Partial<WorkoutEntry> = {},
): WorkoutEntry {
  const baseDate = new Date('2026-01-10T07:30:00.000Z');
  baseDate.setDate(baseDate.getDate() - index);

  const date = baseDate.toISOString().slice(0, 10);
  const loggedAt = new Date(baseDate.getTime() + index * 60000).toISOString();

  return {
    id: `fixture_workout_${index}`,
    date,
    loggedAt,
    createdAt: loggedAt,
    updatedAt: loggedAt,
    kind: 'treadmill',
    source: 'manual',
    intensity: 'moderate',
    metrics: {
      durationSeconds: 1800,
      caloriesKcal: 200,
      distanceKm: 3,
      speedKph: 6,
      inclinePercent: 1,
      averageHeartRateBpm: null,
      steps: null,
      reps: null,
      sets: null,
      weightKg: null,
    },
    notes: {
      title: `Workout ${index}`,
      notes: null,
    },
    isEstimatedCalories: false,
    ...overrides,
  };
}

export const workoutSamples = Object.freeze({
  treadmillA: buildWorkout(0),
  treadmillB: buildWorkout(1, {
    metrics: {
      durationSeconds: 2400,
      caloriesKcal: 260,
      distanceKm: 4,
      speedKph: 6,
      inclinePercent: 2,
      averageHeartRateBpm: null,
      steps: null,
      reps: null,
      sets: null,
      weightKg: null,
    },
  }),
  walkA: buildWorkout(2, {
    kind: 'outdoor-walk',
    metrics: {
      durationSeconds: 2700,
      caloriesKcal: 180,
      distanceKm: 3.4,
      speedKph: 4.5,
      inclinePercent: 0,
      averageHeartRateBpm: null,
      steps: null,
      reps: null,
      sets: null,
      weightKg: null,
    },
  }),
  runA: buildWorkout(3, {
    kind: 'outdoor-run',
    intensity: 'high',
    metrics: {
      durationSeconds: 1500,
      caloriesKcal: 300,
      distanceKm: 4.5,
      speedKph: 10.8,
      inclinePercent: 0,
      averageHeartRateBpm: null,
      steps: null,
      reps: null,
      sets: null,
      weightKg: null,
    },
  }),
  sameDayPair: [
    buildWorkout(0, {
      id: 'same_day_1',
      date: '2026-01-15',
      loggedAt: '2026-01-15T06:30:00.000Z',
      metrics: {
        durationSeconds: 1200,
        caloriesKcal: 100,
        distanceKm: 1.5,
        speedKph: 4.5,
        inclinePercent: 0,
        averageHeartRateBpm: null,
        steps: null,
        reps: null,
        sets: null,
        weightKg: null,
      },
    }),
    buildWorkout(0, {
      id: 'same_day_2',
      date: '2026-01-15',
      loggedAt: '2026-01-15T18:15:00.000Z',
      metrics: {
        durationSeconds: 1800,
        caloriesKcal: 190,
        distanceKm: 2.6,
        speedKph: 5.2,
        inclinePercent: 1,
        averageHeartRateBpm: null,
        steps: null,
        reps: null,
        sets: null,
        weightKg: null,
      },
    }),
  ],
});