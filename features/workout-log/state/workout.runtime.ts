import { useSyncExternalStore } from 'react';

import { createWorkoutService } from '@/features/workout-log/services/workout.service';
import { createWorkoutActions } from '@/features/workout-log/state/workout.actions';
import {
    createWorkoutStore,
    type WorkoutState,
} from '@/features/workout-log/state/workout.store';

export const workoutStore = createWorkoutStore();
export const workoutService = createWorkoutService();
export const workoutActions = createWorkoutActions(workoutStore, workoutService);

export function useWorkoutStoreState(): WorkoutState {
  return useSyncExternalStore(
    workoutStore.subscribe,
    workoutStore.getState,
    workoutStore.getState,
  );
}

export function useWorkoutSelector<T>(selector: (state: WorkoutState) => T): T {
  const state = useWorkoutStoreState();
  return selector(state);
}