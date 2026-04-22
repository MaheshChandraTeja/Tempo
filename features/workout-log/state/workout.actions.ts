import type {
    WorkoutDraft,
    WorkoutEntry,
    WorkoutId,
} from '@/features/workout-log/domain/workout.types';
import type {
    WorkoutService,
    WorkoutServiceError,
} from '@/features/workout-log/services/workout.service';
import type { WorkoutStore } from '@/features/workout-log/state/workout.store';

export type WorkoutActionCreators = Readonly<{
  initialize: () => Promise<boolean>;
  refreshAll: () => Promise<boolean>;
  loadByDate: (date: string) => Promise<boolean>;
  addWorkout: (draft: WorkoutDraft) => Promise<WorkoutEntry | null>;
  editWorkout: (id: WorkoutId, patch: WorkoutDraft) => Promise<WorkoutEntry | null>;
  deleteWorkout: (id: WorkoutId) => Promise<boolean>;
  selectWorkout: (id: WorkoutId | null) => void;
  clearError: () => void;
  resetState: () => void;
}>;

function getServiceErrorMessage(error: WorkoutServiceError): string {
  if (error.issues && error.issues.length > 0) {
    return error.issues[0]?.message ?? error.message;
  }

  return error.message;
}

export function createWorkoutActions(
  store: WorkoutStore,
  service: WorkoutService,
): WorkoutActionCreators {
  return Object.freeze({
    async initialize(): Promise<boolean> {
      if (store.getState().isInitialized) {
        return true;
      }

      store.dispatch({ type: 'WORKOUTS/LOAD_START' });

      const result = await service.listWorkouts();

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return false;
      }

      store.dispatch({
        type: 'WORKOUTS/LOAD_SUCCESS',
        payload: {
          entries: result.data,
          dateFilter: null,
        },
      });

      return true;
    },

    async refreshAll(): Promise<boolean> {
      store.dispatch({ type: 'WORKOUTS/LOAD_START' });

      const result = await service.listWorkouts();

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return false;
      }

      store.dispatch({
        type: 'WORKOUTS/LOAD_SUCCESS',
        payload: {
          entries: result.data,
          dateFilter: null,
        },
      });

      return true;
    },

    async loadByDate(date: string): Promise<boolean> {
      store.dispatch({ type: 'WORKOUTS/LOAD_START' });

      const result = await service.getWorkoutsByDate(date);

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return false;
      }

      store.dispatch({
        type: 'WORKOUTS/SET_DATE_FILTER',
        payload: { date },
      });

      store.dispatch({
        type: 'WORKOUTS/LOAD_SUCCESS',
        payload: {
          entries: result.data,
          dateFilter: date,
        },
      });

      return true;
    },

    async addWorkout(draft: WorkoutDraft): Promise<WorkoutEntry | null> {
      const result = await service.createWorkout(draft);

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return null;
      }

      store.dispatch({
        type: 'WORKOUTS/UPSERT_ONE',
        payload: { entry: result.data },
      });

      return result.data;
    },

    async editWorkout(
      id: WorkoutId,
      patch: WorkoutDraft,
    ): Promise<WorkoutEntry | null> {
      const result = await service.updateWorkout(id, patch);

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return null;
      }

      store.dispatch({
        type: 'WORKOUTS/UPSERT_ONE',
        payload: { entry: result.data },
      });

      return result.data;
    },

    async deleteWorkout(id: WorkoutId): Promise<boolean> {
      const result = await service.deleteWorkout(id);

      if (!result.ok) {
        store.dispatch({
          type: 'WORKOUTS/LOAD_FAILURE',
          payload: { error: getServiceErrorMessage(result.error) },
        });
        return false;
      }

      store.dispatch({
        type: 'WORKOUTS/REMOVE_ONE',
        payload: { id },
      });

      return true;
    },

    selectWorkout(id: WorkoutId | null): void {
      store.dispatch({
        type: 'WORKOUTS/SELECT',
        payload: { id },
      });
    },

    clearError(): void {
      store.dispatch({ type: 'WORKOUTS/CLEAR_ERROR' });
    },

    resetState(): void {
      store.dispatch({ type: 'WORKOUTS/RESET' });
    },
  });
}