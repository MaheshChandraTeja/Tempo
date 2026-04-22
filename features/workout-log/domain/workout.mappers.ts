import {
    estimateWorkoutCalories,
    shouldEstimateCalories,
} from '@/features/workout-log/domain/calorie.rules';
import {
    validateWorkoutDraft,
    validateWorkoutEntry,
} from '@/features/workout-log/domain/workout.schema';
import type {
    WorkoutDraft,
    WorkoutEntry,
    WorkoutMetrics,
    WorkoutValidationResult,
} from '@/features/workout-log/domain/workout.types';

function safeTrim(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function round(value: number | null, decimals = 0): number | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function makeId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toIsoDateString(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(`${input}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createEmptyMetrics(): WorkoutMetrics {
  return {
    durationSeconds: null,
    caloriesKcal: null,
    distanceKm: null,
    speedKph: null,
    inclinePercent: null,
    averageHeartRateBpm: null,
    steps: null,
    reps: null,
    sets: null,
    weightKg: null,
  };
}

export function normalizeWorkoutDraft(draft: WorkoutDraft): WorkoutDraft {
  return {
    ...draft,
    date: draft.date ? toIsoDateString(draft.date) : null,
    loggedAt: draft.loggedAt ?? null,
    kind: draft.kind ?? null,
    source: draft.source ?? 'manual',
    intensity: draft.intensity ?? null,
    durationSeconds: round(draft.durationSeconds ?? null, 0),
    caloriesKcal: round(draft.caloriesKcal ?? null, 0),
    distanceKm: round(draft.distanceKm ?? null, 2),
    speedKph: round(draft.speedKph ?? null, 2),
    inclinePercent: round(draft.inclinePercent ?? null, 1),
    averageHeartRateBpm: round(draft.averageHeartRateBpm ?? null, 0),
    steps: round(draft.steps ?? null, 0),
    reps: round(draft.reps ?? null, 0),
    sets: round(draft.sets ?? null, 0),
    weightKg: round(draft.weightKg ?? null, 2),
    title: safeTrim(draft.title),
    notes: safeTrim(draft.notes),
  };
}

export function draftToWorkoutEntry(
  input: WorkoutDraft,
  options: Readonly<{
    now?: Date;
    generateId?: () => string;
  }> = {},
): WorkoutValidationResult<WorkoutEntry> {
  const normalizedDraft = normalizeWorkoutDraft(input);
  const draftValidation = validateWorkoutDraft(normalizedDraft);

  if (!draftValidation.ok) {
    return {
      ok: false,
      value: null,
      issues: draftValidation.issues,
    };
  }

  const now = options.now ?? new Date();
  const nowIso = now.toISOString();
  const id = normalizedDraft.id ?? options.generateId?.() ?? makeId();
  const date = normalizedDraft.date ?? toIsoDateString(now);
  const loggedAt = normalizedDraft.loggedAt ?? nowIso;

  const metrics: WorkoutMetrics = {
    ...createEmptyMetrics(),
    durationSeconds: normalizedDraft.durationSeconds ?? null,
    caloriesKcal: normalizedDraft.caloriesKcal ?? null,
    distanceKm: normalizedDraft.distanceKm ?? null,
    speedKph: normalizedDraft.speedKph ?? null,
    inclinePercent: normalizedDraft.inclinePercent ?? null,
    averageHeartRateBpm: normalizedDraft.averageHeartRateBpm ?? null,
    steps: normalizedDraft.steps ?? null,
    reps: normalizedDraft.reps ?? null,
    sets: normalizedDraft.sets ?? null,
    weightKg: normalizedDraft.weightKg ?? null,
  };

  let isEstimatedCalories = false;

  if (shouldEstimateCalories(metrics.caloriesKcal)) {
    const estimate = estimateWorkoutCalories({
      kind: normalizedDraft.kind!,
      durationSeconds: metrics.durationSeconds,
      distanceKm: metrics.distanceKm,
      speedKph: metrics.speedKph,
      inclinePercent: metrics.inclinePercent,
      intensity: normalizedDraft.intensity,
      weightKg: metrics.weightKg,
    });

    metrics.caloriesKcal = estimate.caloriesKcal;
    isEstimatedCalories = true;
  }

  const entry: WorkoutEntry = {
    id,
    date,
    loggedAt,
    createdAt: nowIso,
    updatedAt: nowIso,
    kind: normalizedDraft.kind!,
    source: normalizedDraft.source!,
    intensity: normalizedDraft.intensity ?? null,
    metrics,
    notes: {
      title: normalizedDraft.title ?? null,
      notes: normalizedDraft.notes ?? null,
    },
    isEstimatedCalories,
  };

  return validateWorkoutEntry(entry);
}

export function workoutEntryToDraft(entry: WorkoutEntry): WorkoutDraft {
  return {
    id: entry.id,
    date: entry.date,
    loggedAt: entry.loggedAt,
    kind: entry.kind,
    source: entry.source,
    intensity: entry.intensity,
    durationSeconds: entry.metrics.durationSeconds,
    caloriesKcal: entry.metrics.caloriesKcal,
    distanceKm: entry.metrics.distanceKm,
    speedKph: entry.metrics.speedKph,
    inclinePercent: entry.metrics.inclinePercent,
    averageHeartRateBpm: entry.metrics.averageHeartRateBpm,
    steps: entry.metrics.steps,
    reps: entry.metrics.reps,
    sets: entry.metrics.sets,
    weightKg: entry.metrics.weightKg,
    title: entry.notes.title,
    notes: entry.notes.notes,
  };
}

export function updateWorkoutEntry(
  current: WorkoutEntry,
  patch: WorkoutDraft,
  options: Readonly<{
    now?: Date;
  }> = {},
): WorkoutValidationResult<WorkoutEntry> {
  const mergedDraft: WorkoutDraft = {
    ...workoutEntryToDraft(current),
    ...patch,
    id: current.id,
  };

  const next = draftToWorkoutEntry(mergedDraft, {
    now: options.now ?? new Date(),
    generateId: () => current.id,
  });

  if (!next.ok) {
    return next;
  }

  return {
    ok: true,
    value: {
      ...next.value,
      createdAt: current.createdAt,
      updatedAt: (options.now ?? new Date()).toISOString(),
    },
    issues: [],
  };
}

export function toWorkoutListItem(entry: WorkoutEntry): Readonly<{
  id: string;
  title: string;
  subtitle: string;
  caloriesKcal: number | null;
  durationSeconds: number | null;
  loggedAt: string;
}> {
  const title =
    entry.notes.title ??
    `${entry.kind.charAt(0).toUpperCase()}${entry.kind.slice(1).replace(/-/g, ' ')}`;

  const subtitleParts = [
    entry.metrics.distanceKm != null ? `${entry.metrics.distanceKm} km` : null,
    entry.metrics.speedKph != null ? `${entry.metrics.speedKph} kph` : null,
    entry.metrics.inclinePercent != null ? `${entry.metrics.inclinePercent}% incline` : null,
  ].filter(Boolean);

  return {
    id: entry.id,
    title,
    subtitle: subtitleParts.join(' • '),
    caloriesKcal: entry.metrics.caloriesKcal,
    durationSeconds: entry.metrics.durationSeconds,
    loggedAt: entry.loggedAt,
  };
}