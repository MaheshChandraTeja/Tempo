import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const getDatabaseMock = jest.fn();

jest.mock('@/storage/db/database', () => ({
  getDatabase: () => getDatabaseMock(),
}));

import { createWorkoutsRepository } from '@/storage/db/repositories/workouts.repository';

function createWorkoutRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'repo_workout_1',
    date: '2026-01-10',
    logged_at: '2026-01-10T07:30:00.000Z',
    kind: 'treadmill',
    source: 'manual',
    intensity: 'moderate',
    duration_seconds: 1800,
    calories_kcal: 200,
    distance_km: 3,
    speed_kph: 6,
    incline_percent: 1,
    average_heart_rate_bpm: null,
    steps: null,
    reps: null,
    sets: null,
    weight_kg: null,
    title: 'Repo Workout',
    notes: 'Repository test',
    is_estimated_calories: 0,
    source_confidence: null,
    created_at: '2026-01-10T07:30:00.000Z',
    updated_at: '2026-01-10T07:30:00.000Z',
    ...overrides,
  };
}

function createWorkoutEntry(): WorkoutEntry {
  return {
    id: 'repo_workout_1',
    date: '2026-01-10',
    loggedAt: '2026-01-10T07:30:00.000Z',
    createdAt: '2026-01-10T07:30:00.000Z',
    updatedAt: '2026-01-10T07:30:00.000Z',
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
      title: 'Repo Workout',
      notes: 'Repository test',
    },
    isEstimatedCalories: false,
  };
}

describe('workouts repository integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps rows from listAll into workout entries', async () => {
    getDatabaseMock.mockResolvedValue({
      getAllAsync: jest.fn().mockResolvedValue([createWorkoutRow()]),
    });

    const repository = createWorkoutsRepository();
    const result = await repository.listAll();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('repo_workout_1');
    expect(result[0]?.metrics.distanceKm).toBe(3);
  });

  it('returns null when getById finds no row', async () => {
    getDatabaseMock.mockResolvedValue({
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });

    const repository = createWorkoutsRepository();
    const result = await repository.getById('missing');

    expect(result).toBeNull();
  });

  it('upserts a workout entry with the expected SQL call', async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);

    getDatabaseMock.mockResolvedValue({
      runAsync,
    });

    const repository = createWorkoutsRepository();
    const entry = createWorkoutEntry();

    await repository.upsert(entry);

    expect(runAsync).toHaveBeenCalledTimes(1);
    expect(String(runAsync.mock.calls[0][0])).toContain('INSERT INTO workouts');
    expect(runAsync.mock.calls[0][1]).toBe(entry.id);
  });

  it('removes a workout by id', async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);

    getDatabaseMock.mockResolvedValue({
      runAsync,
    });

    const repository = createWorkoutsRepository();
    await repository.remove('repo_workout_1');

    expect(runAsync).toHaveBeenCalledWith(
      'DELETE FROM workouts WHERE id = ?;',
      'repo_workout_1',
    );
  });
});