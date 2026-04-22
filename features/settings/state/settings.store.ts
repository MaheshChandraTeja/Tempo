import { useSyncExternalStore } from 'react';

export type SettingsState = Readonly<{
  debugModeEnabled: boolean;
  isExporting: boolean;
  isClearingLocalData: boolean;
  lastExportedAt: string | null;
  error: string | null;
}>;

export type SettingsStore = Readonly<{
  getState: () => SettingsState;
  subscribe: (listener: () => void) => () => void;
  setDebugModeEnabled: (enabled: boolean) => void;
  startExport: () => void;
  finishExport: (exportedAt?: string | null) => void;
  failExport: (message: string) => void;
  startClearLocalData: () => void;
  finishClearLocalData: () => void;
  failClearLocalData: (message: string) => void;
  clearError: () => void;
  reset: () => void;
}>;

const initialSettingsState: SettingsState = Object.freeze({
  debugModeEnabled: false,
  isExporting: false,
  isClearingLocalData: false,
  lastExportedAt: null,
  error: null,
});

export function createSettingsStore(
  initialState: SettingsState = initialSettingsState,
): SettingsStore {
  let currentState = initialState;
  const listeners = new Set<() => void>();

  const emit = (): void => {
    listeners.forEach(listener => listener());
  };

  const update = (updater: (current: SettingsState) => SettingsState): void => {
    currentState = updater(currentState);
    emit();
  };

  return Object.freeze({
    getState(): SettingsState {
      return currentState;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    setDebugModeEnabled(enabled: boolean): void {
      update(current => ({
        ...current,
        debugModeEnabled: enabled,
        error: null,
      }));
    },

    startExport(): void {
      update(current => ({
        ...current,
        isExporting: true,
        error: null,
      }));
    },

    finishExport(exportedAt?: string | null): void {
      update(current => ({
        ...current,
        isExporting: false,
        lastExportedAt: exportedAt ?? new Date().toISOString(),
        error: null,
      }));
    },

    failExport(message: string): void {
      update(current => ({
        ...current,
        isExporting: false,
        error: message,
      }));
    },

    startClearLocalData(): void {
      update(current => ({
        ...current,
        isClearingLocalData: true,
        error: null,
      }));
    },

    finishClearLocalData(): void {
      update(current => ({
        ...current,
        isClearingLocalData: false,
        error: null,
      }));
    },

    failClearLocalData(message: string): void {
      update(current => ({
        ...current,
        isClearingLocalData: false,
        error: message,
      }));
    },

    clearError(): void {
      update(current => ({
        ...current,
        error: null,
      }));
    },

    reset(): void {
      currentState = initialSettingsState;
      emit();
    },
  });
}

export const settingsStore = createSettingsStore();

export function useSettingsState(): SettingsState {
  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getState,
    settingsStore.getState,
  );
}

export function useSettingsSelector<T>(selector: (state: SettingsState) => T): T {
  const state = useSettingsState();
  return selector(state);
}