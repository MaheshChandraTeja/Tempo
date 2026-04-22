import { useSyncExternalStore } from 'react';

import type { EditableScanFields, ScanSession, ScanSessionStatus } from '@/features/scan/domain/scan.types';
import { createEmptyScanSession } from '@/features/scan/services/scan.session.service';

export type ScanState = Readonly<{
  currentSession: ScanSession;
  debugModeEnabled: boolean;
}>;

export type ScanStore = Readonly<{
  getState: () => ScanState;
  subscribe: (listener: () => void) => () => void;
  beginSession: () => void;
  setStatus: (status: ScanSessionStatus) => void;
  setError: (error: string | null) => void;
  setPipelineResult: (session: ScanSession) => void;
  updateFields: (fields: Partial<EditableScanFields>) => void;
  setNotes: (notes: string | null) => void;
  setSavedWorkoutId: (workoutId: string | null) => void;
  setDebugModeEnabled: (enabled: boolean) => void;
  reset: () => void;
}>;

const initialState: ScanState = Object.freeze({
  currentSession: createEmptyScanSession(),
  debugModeEnabled: __DEV__,
});

export function createScanStore(
  seed: ScanState = initialState,
): ScanStore {
  let currentState = seed;
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach(listener => listener());
  };

  const update = (updater: (state: ScanState) => ScanState) => {
    currentState = updater(currentState);
    emit();
  };

  return Object.freeze({
    getState() {
      return currentState;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    beginSession() {
      update(state => ({
        ...state,
        currentSession: createEmptyScanSession(),
      }));
    },

    setStatus(status) {
      update(state => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          updatedAt: new Date().toISOString(),
          status,
        },
      }));
    },

    setError(error) {
      update(state => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          updatedAt: new Date().toISOString(),
          error,
        },
      }));
    },

    setPipelineResult(session) {
      update(state => ({
        ...state,
        currentSession: session,
      }));
    },

    updateFields(fields) {
      update(state => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          updatedAt: new Date().toISOString(),
          editableFields: {
            ...state.currentSession.editableFields,
            ...fields,
          },
        },
      }));
    },

    setNotes(notes) {
      update(state => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          updatedAt: new Date().toISOString(),
          notes,
        },
      }));
    },

    setSavedWorkoutId(workoutId) {
      update(state => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          updatedAt: new Date().toISOString(),
          savedWorkoutId: workoutId,
        },
      }));
    },

    setDebugModeEnabled(enabled) {
      update(state => ({
        ...state,
        debugModeEnabled: enabled,
      }));
    },

    reset() {
      currentState = initialState;
      emit();
    },
  });
}

export const scanStore = createScanStore();

export function useScanState(): ScanState {
  return useSyncExternalStore(
    scanStore.subscribe,
    scanStore.getState,
    scanStore.getState,
  );
}

export function useScanSelector<T>(selector: (state: ScanState) => T): T {
  const state = useScanState();
  return selector(state);
}