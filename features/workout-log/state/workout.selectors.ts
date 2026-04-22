import type {
    WorkoutEntry,
    WorkoutId,
} from '@/features/workout-log/domain/workout.types';
import type { WorkoutState } from '@/features/workout-log/state/workout.store';

export type WorkoutListItem = Readonly<{
  id: WorkoutId;
  title: string;
  subtitle: string;
  loggedAt: string;
  caloriesKcal: number | null;
  durationSeconds: number | null;
}>;

function formatWorkoutTitle(entry: WorkoutEntry): string {
  if (entry.notes.title && entry.notes.title.trim().length > 0) {
    return entry.notes.title.trim();
  }

  const label = entry.kind.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatWorkoutSubtitle(entry: WorkoutEntry): string {
  const parts: string[] = [];

  if (entry.metrics.distanceKm != null) {
    parts.push(`${entry.metrics.distanceKm} km`);
  }

  if (entry.metrics.speedKph != null) {
    parts.push(`${entry.metrics.speedKph} kph`);
  }

  if (entry.metrics.inclinePercent != null) {
    parts.push(`${entry.metrics.inclinePercent}% incline`);
  }

  if (parts.length === 0) {
    parts.push(entry.source.replace(/-/g, ' '));
  }

  return parts.join(' • ');
}

export function selectWorkoutEntities(state: WorkoutState): WorkoutState['entities'] {
  return state.entities;
}

export function selectAllWorkoutIds(state: WorkoutState): WorkoutId[] {
  return state.allIds;
}

export function selectAllWorkouts(state: WorkoutState): WorkoutEntry[] {
  return state.allIds
    .map(id => state.entities[id])
    .filter((entry): entry is WorkoutEntry => Boolean(entry));
}

export function selectWorkoutById(
  state: WorkoutState,
  id: WorkoutId,
): WorkoutEntry | null {
  return state.entities[id] ?? null;
}

export function selectSelectedWorkout(state: WorkoutState): WorkoutEntry | null {
  if (!state.selectedWorkoutId) {
    return null;
  }

  return selectWorkoutById(state, state.selectedWorkoutId);
}

export function selectSelectedWorkoutId(state: WorkoutState): WorkoutId | null {
  return state.selectedWorkoutId;
}

export function selectActiveDateFilter(state: WorkoutState): string | null {
  return state.activeDateFilter;
}

export function selectWorkoutsByDate(
  state: WorkoutState,
  date: string,
): WorkoutEntry[] {
  const ids = state.idsByDate[date] ?? [];

  return ids
    .map(id => state.entities[id])
    .filter((entry): entry is WorkoutEntry => Boolean(entry));
}

export function selectVisibleWorkouts(state: WorkoutState): WorkoutEntry[] {
  if (!state.activeDateFilter) {
    return selectAllWorkouts(state);
  }

  return selectWorkoutsByDate(state, state.activeDateFilter);
}

export function selectWorkoutListItems(state: WorkoutState): WorkoutListItem[] {
  return selectVisibleWorkouts(state).map(entry => ({
    id: entry.id,
    title: formatWorkoutTitle(entry),
    subtitle: formatWorkoutSubtitle(entry),
    loggedAt: entry.loggedAt,
    caloriesKcal: entry.metrics.caloriesKcal,
    durationSeconds: entry.metrics.durationSeconds,
  }));
}

export function selectWorkoutError(state: WorkoutState): string | null {
  return state.error;
}

export function selectWorkoutLoading(state: WorkoutState): boolean {
  return state.isLoading;
}

export function selectWorkoutInitialized(state: WorkoutState): boolean {
  return state.isInitialized;
}

export function selectWorkoutCount(state: WorkoutState): number {
  return state.allIds.length;
}

export function selectTotalCaloriesForVisibleWorkouts(state: WorkoutState): number {
  return selectVisibleWorkouts(state).reduce((sum, entry) => {
    return sum + (entry.metrics.caloriesKcal ?? 0);
  }, 0);
}

export function selectTotalDurationForVisibleWorkouts(state: WorkoutState): number {
  return selectVisibleWorkouts(state).reduce((sum, entry) => {
    return sum + (entry.metrics.durationSeconds ?? 0);
  }, 0);
}

export function selectDatesWithWorkouts(state: WorkoutState): string[] {
  return Object.keys(state.idsByDate).sort((left, right) => {
    return new Date(right).getTime() - new Date(left).getTime();
  });
}