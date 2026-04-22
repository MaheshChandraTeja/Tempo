import type {
    WorkoutDraft,
    WorkoutEntry,
    WorkoutId,
} from '@/features/workout-log/domain/workout.types';

export type WorkoutEntities = Readonly<Record<WorkoutId, WorkoutEntry>>;
export type WorkoutIdsByDate = Readonly<Record<string, WorkoutId[]>>;

export type WorkoutState = Readonly<{
  entities: WorkoutEntities;
  allIds: WorkoutId[];
  idsByDate: WorkoutIdsByDate;
  selectedWorkoutId: WorkoutId | null;
  activeDateFilter: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}>;

export type WorkoutAction =
  | Readonly<{ type: 'WORKOUTS/LOAD_START' }>
  | Readonly<{
      type: 'WORKOUTS/LOAD_SUCCESS';
      payload: {
        entries: WorkoutEntry[];
        dateFilter?: string | null;
      };
    }>
  | Readonly<{ type: 'WORKOUTS/LOAD_FAILURE'; payload: { error: string } }>
  | Readonly<{ type: 'WORKOUTS/UPSERT_ONE'; payload: { entry: WorkoutEntry } }>
  | Readonly<{ type: 'WORKOUTS/REMOVE_ONE'; payload: { id: WorkoutId } }>
  | Readonly<{ type: 'WORKOUTS/SELECT'; payload: { id: WorkoutId | null } }>
  | Readonly<{ type: 'WORKOUTS/SET_DATE_FILTER'; payload: { date: string | null } }>
  | Readonly<{ type: 'WORKOUTS/CLEAR_ERROR' }>
  | Readonly<{ type: 'WORKOUTS/RESET' }>;

export type WorkoutStore = Readonly<{
  getState: () => WorkoutState;
  dispatch: (action: WorkoutAction) => void;
  subscribe: (listener: () => void) => () => void;
}>;

export const initialWorkoutState: WorkoutState = Object.freeze({
  entities: {},
  allIds: [],
  idsByDate: {},
  selectedWorkoutId: null,
  activeDateFilter: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  lastSyncedAt: null,
});

function sortIdsByLoggedAtDescending(
  entities: Record<WorkoutId, WorkoutEntry>,
  ids: WorkoutId[],
): WorkoutId[] {
  return [...ids].sort((leftId, rightId) => {
    const left = entities[leftId];
    const right = entities[rightId];

    if (!left || !right) {
      return 0;
    }

    return new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime();
  });
}

function indexByDate(entries: readonly WorkoutEntry[]): Record<string, WorkoutId[]> {
  const next: Record<string, WorkoutId[]> = {};

  for (const entry of entries) {
    if (!next[entry.date]) {
      next[entry.date] = [];
    }

    next[entry.date].push(entry.id);
  }

  return next;
}

function normalizeEntries(
  entries: readonly WorkoutEntry[],
): Pick<WorkoutState, 'entities' | 'allIds' | 'idsByDate'> {
  const entities: Record<WorkoutId, WorkoutEntry> = {};

  for (const entry of entries) {
    entities[entry.id] = entry;
  }

  const allIds = sortIdsByLoggedAtDescending(
    entities,
    entries.map(entry => entry.id),
  );

  const idsByDate = indexByDate(
    allIds
      .map(id => entities[id])
      .filter((entry): entry is WorkoutEntry => Boolean(entry)),
  );

  return {
    entities,
    allIds,
    idsByDate,
  };
}

function upsertEntry(
  state: WorkoutState,
  entry: WorkoutEntry,
): Pick<WorkoutState, 'entities' | 'allIds' | 'idsByDate'> {
  const entities: Record<WorkoutId, WorkoutEntry> = {
    ...state.entities,
    [entry.id]: entry,
  };

  const allIdsSet = new Set(state.allIds);
  allIdsSet.add(entry.id);

  const allIds = sortIdsByLoggedAtDescending(entities, [...allIdsSet]);

  const allEntries = allIds
    .map(id => entities[id])
    .filter((item): item is WorkoutEntry => Boolean(item));

  return {
    entities,
    allIds,
    idsByDate: indexByDate(allEntries),
  };
}

function removeEntry(
  state: WorkoutState,
  id: WorkoutId,
): Pick<WorkoutState, 'entities' | 'allIds' | 'idsByDate'> {
  const entities: Record<WorkoutId, WorkoutEntry> = { ...state.entities };
  delete entities[id];

  const allIds = state.allIds.filter(itemId => itemId !== id);

  const allEntries = allIds
    .map(itemId => entities[itemId])
    .filter((item): item is WorkoutEntry => Boolean(item));

  return {
    entities,
    allIds,
    idsByDate: indexByDate(allEntries),
  };
}

export function workoutReducer(
  state: WorkoutState,
  action: WorkoutAction,
): WorkoutState {
  switch (action.type) {
    case 'WORKOUTS/LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'WORKOUTS/LOAD_SUCCESS': {
      const normalized = normalizeEntries(action.payload.entries);

      return {
        ...state,
        ...normalized,
        isInitialized: true,
        isLoading: false,
        error: null,
        activeDateFilter: action.payload.dateFilter ?? state.activeDateFilter,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    case 'WORKOUTS/LOAD_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case 'WORKOUTS/UPSERT_ONE': {
      const next = upsertEntry(state, action.payload.entry);

      return {
        ...state,
        ...next,
        error: null,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    case 'WORKOUTS/REMOVE_ONE': {
      const next = removeEntry(state, action.payload.id);
      const selectedWorkoutId =
        state.selectedWorkoutId === action.payload.id
          ? null
          : state.selectedWorkoutId;

      return {
        ...state,
        ...next,
        selectedWorkoutId,
        error: null,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    case 'WORKOUTS/SELECT':
      return {
        ...state,
        selectedWorkoutId: action.payload.id,
      };

    case 'WORKOUTS/SET_DATE_FILTER':
      return {
        ...state,
        activeDateFilter: action.payload.date,
      };

    case 'WORKOUTS/CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'WORKOUTS/RESET':
      return {
        ...initialWorkoutState,
      };

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function createWorkoutStore(
  initialState: WorkoutState = initialWorkoutState,
): WorkoutStore {
  let currentState = initialState;
  const listeners = new Set<() => void>();

  return Object.freeze({
    getState(): WorkoutState {
      return currentState;
    },

    dispatch(action: WorkoutAction): void {
      currentState = workoutReducer(currentState, action);

      listeners.forEach(listener => {
        listener();
      });
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  });
}

export type WorkoutCommandInput = Readonly<{
  draft: WorkoutDraft;
}>;

export type WorkoutUpdateCommandInput = Readonly<{
  id: WorkoutId;
  patch: WorkoutDraft;
}>;