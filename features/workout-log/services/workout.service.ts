import {
  draftToWorkoutEntry,
  updateWorkoutEntry,
} from '@/features/workout-log/domain/workout.mappers';
import type {
  WorkoutDraft,
  WorkoutEntry,
  WorkoutId,
  WorkoutValidationIssue,
} from '@/features/workout-log/domain/workout.types';
import { getSummariesRepository } from '@/storage/db/repositories/summaries.repository';
import { getWorkoutsRepository } from '@/storage/db/repositories/workouts.repository';
import { getDemoWorkouts } from '@/storage/db/seed/demoWorkouts';
import { getRuntimeFlag, RUNTIME_FLAG_KEYS, setRuntimeFlag } from '@/storage/kv/runtimeFlags';

export type WorkoutServiceErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';

export type WorkoutServiceError = Readonly<{
  code: WorkoutServiceErrorCode;
  message: string;
  issues?: WorkoutValidationIssue[];
}>;

export type WorkoutServiceResult<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; error: WorkoutServiceError }>;

export type WorkoutQuery = Readonly<{
  date?: string;
}>;

export type WorkoutService = Readonly<{
  listWorkouts: (query?: WorkoutQuery) => Promise<WorkoutServiceResult<WorkoutEntry[]>>;
  getWorkoutById: (id: WorkoutId) => Promise<WorkoutServiceResult<WorkoutEntry>>;
  getWorkoutsByDate: (date: string) => Promise<WorkoutServiceResult<WorkoutEntry[]>>;
  createWorkout: (draft: WorkoutDraft) => Promise<WorkoutServiceResult<WorkoutEntry>>;
  updateWorkout: (
    id: WorkoutId,
    patch: WorkoutDraft,
  ) => Promise<WorkoutServiceResult<WorkoutEntry>>;
  deleteWorkout: (id: WorkoutId) => Promise<WorkoutServiceResult<{ id: WorkoutId }>>;
}>;

function success<T>(data: T): WorkoutServiceResult<T> {
  return { ok: true, data };
}

function failure<T>(
  code: WorkoutServiceErrorCode,
  message: string,
  issues?: WorkoutValidationIssue[],
): WorkoutServiceResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      issues,
    },
  };
}

async function ensureSeedData(): Promise<void> {
  const alreadySeeded = await getRuntimeFlag(RUNTIME_FLAG_KEYS.seededDemoData);

  if (alreadySeeded) {
    return;
  }

  const workoutsRepository = getWorkoutsRepository();
  const count = await workoutsRepository.count();

  if (count > 0) {
    await setRuntimeFlag(RUNTIME_FLAG_KEYS.seededDemoData, true);
    return;
  }

  for (const workout of getDemoWorkouts()) {
    await workoutsRepository.upsert(workout);
  }

  await getSummariesRepository().rebuildAll();
  await setRuntimeFlag(RUNTIME_FLAG_KEYS.seededDemoData, true);
}

export function createWorkoutService(): WorkoutService {
  const workoutsRepository = getWorkoutsRepository();
  const summariesRepository = getSummariesRepository();

  return Object.freeze({
    async listWorkouts(query?: WorkoutQuery): Promise<WorkoutServiceResult<WorkoutEntry[]>> {
      try {
        await ensureSeedData();
        const entries = query?.date
          ? await workoutsRepository.listByDate(query.date)
          : await workoutsRepository.listAll();

        return success(entries);
      } catch (error) {
        return failure(
          'UNKNOWN',
          error instanceof Error ? error.message : 'Failed to list workouts.',
        );
      }
    },

    async getWorkoutById(id: WorkoutId): Promise<WorkoutServiceResult<WorkoutEntry>> {
      try {
        await ensureSeedData();
        const entry = await workoutsRepository.getById(id);

        if (!entry) {
          return failure('NOT_FOUND', `Workout with id "${id}" was not found.`);
        }

        return success(entry);
      } catch (error) {
        return failure(
          'UNKNOWN',
          error instanceof Error ? error.message : 'Failed to fetch workout.',
        );
      }
    },

    async getWorkoutsByDate(date: string): Promise<WorkoutServiceResult<WorkoutEntry[]>> {
      return this.listWorkouts({ date });
    },

    async createWorkout(draft: WorkoutDraft): Promise<WorkoutServiceResult<WorkoutEntry>> {
      const mapped = draftToWorkoutEntry(draft);

      if (!mapped.ok) {
        return failure(
          'VALIDATION_FAILED',
          'Workout draft validation failed.',
          mapped.issues,
        );
      }

      try {
        await workoutsRepository.upsert(mapped.value);
        await summariesRepository.rebuildForDate(mapped.value.date);
        return success(mapped.value);
      } catch (error) {
        return failure(
          'UNKNOWN',
          error instanceof Error ? error.message : 'Failed to create workout.',
        );
      }
    },

    async updateWorkout(
      id: WorkoutId,
      patch: WorkoutDraft,
    ): Promise<WorkoutServiceResult<WorkoutEntry>> {
      try {
        const existing = await workoutsRepository.getById(id);

        if (!existing) {
          return failure('NOT_FOUND', `Workout with id "${id}" was not found.`);
        }

        const updated = updateWorkoutEntry(existing, patch);

        if (!updated.ok) {
          return failure(
            'VALIDATION_FAILED',
            'Workout update validation failed.',
            updated.issues,
          );
        }

        await workoutsRepository.upsert(updated.value);
        await summariesRepository.rebuildForDate(updated.value.date);
        return success(updated.value);
      } catch (error) {
        return failure(
          'UNKNOWN',
          error instanceof Error ? error.message : 'Failed to update workout.',
        );
      }
    },

    async deleteWorkout(
      id: WorkoutId,
    ): Promise<WorkoutServiceResult<{ id: WorkoutId }>> {
      try {
        const existing = await workoutsRepository.getById(id);

        if (!existing) {
          return failure('NOT_FOUND', `Workout with id "${id}" was not found.`);
        }

        await workoutsRepository.remove(id);
        await summariesRepository.rebuildForDate(existing.date);
        return success({ id });
      } catch (error) {
        return failure(
          'UNKNOWN',
          error instanceof Error ? error.message : 'Failed to delete workout.',
        );
      }
    },
  });
}