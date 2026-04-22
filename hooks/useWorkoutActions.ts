import { useCallback, useMemo, useState } from 'react';

import type { WorkoutActionState, WorkoutDraft } from '@/types/common';

type UseWorkoutActionsOptions = Readonly<{
  onSave?: (draft: WorkoutDraft) => Promise<void> | void;
  onDelete?: (draftId: string) => Promise<void> | void;
  onReset?: () => Promise<void> | void;
}>;

type UseWorkoutActionsResult = Readonly<{
  state: WorkoutActionState;
  saveWorkout: (draft: WorkoutDraft) => Promise<boolean>;
  deleteWorkout: (draftId: string) => Promise<boolean>;
  resetWorkout: () => Promise<boolean>;
  clearError: () => void;
}>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function useWorkoutActions(
  options: UseWorkoutActionsOptions = {},
): UseWorkoutActionsResult {
  const { onSave, onDelete, onReset } = options;

  const [state, setState] = useState<WorkoutActionState>({
    isSaving: false,
    isDeleting: false,
    isResetting: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(current => ({
      ...current,
      error: null,
    }));
  }, []);

  const saveWorkout = useCallback(
    async (draft: WorkoutDraft): Promise<boolean> => {
      if (!onSave) {
        return true;
      }

      setState(current => ({
        ...current,
        isSaving: true,
        error: null,
      }));

      try {
        await onSave(draft);

        setState(current => ({
          ...current,
          isSaving: false,
        }));

        return true;
      } catch (error) {
        setState(current => ({
          ...current,
          isSaving: false,
          error: getErrorMessage(error),
        }));

        return false;
      }
    },
    [onSave],
  );

  const deleteWorkout = useCallback(
    async (draftId: string): Promise<boolean> => {
      if (!onDelete) {
        return true;
      }

      setState(current => ({
        ...current,
        isDeleting: true,
        error: null,
      }));

      try {
        await onDelete(draftId);

        setState(current => ({
          ...current,
          isDeleting: false,
        }));

        return true;
      } catch (error) {
        setState(current => ({
          ...current,
          isDeleting: false,
          error: getErrorMessage(error),
        }));

        return false;
      }
    },
    [onDelete],
  );

  const resetWorkout = useCallback(async (): Promise<boolean> => {
    if (!onReset) {
      return true;
    }

    setState(current => ({
      ...current,
      isResetting: true,
      error: null,
    }));

    try {
      await onReset();

      setState(current => ({
        ...current,
        isResetting: false,
      }));

      return true;
    } catch (error) {
      setState(current => ({
        ...current,
        isResetting: false,
        error: getErrorMessage(error),
      }));

      return false;
    }
  }, [onReset]);

  return useMemo(
    () => ({
      state,
      saveWorkout,
      deleteWorkout,
      resetWorkout,
      clearError,
    }),
    [clearError, deleteWorkout, resetWorkout, saveWorkout, state],
  );
}