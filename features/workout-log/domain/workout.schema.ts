import type {
    WorkoutDraft,
    WorkoutEntry,
    WorkoutIntensity,
    WorkoutKind,
    WorkoutMetrics,
    WorkoutSource,
    WorkoutValidationIssue,
    WorkoutValidationResult,
} from '@/features/workout-log/domain/workout.types';

const LIMITS = Object.freeze({
  durationSeconds: { min: 0, max: 24 * 60 * 60 },
  caloriesKcal: { min: 0, max: 10000 },
  distanceKm: { min: 0, max: 300 },
  speedKph: { min: 0, max: 80 },
  inclinePercent: { min: 0, max: 40 },
  averageHeartRateBpm: { min: 0, max: 240 },
  steps: { min: 0, max: 100000 },
  reps: { min: 0, max: 10000 },
  sets: { min: 0, max: 1000 },
  weightKg: { min: 0, max: 1000 },
  titleLength: { min: 0, max: 120 },
  notesLength: { min: 0, max: 4000 },
});

const KIND_SET = new Set<WorkoutKind>([
  'treadmill',
  'outdoor-walk',
  'outdoor-run',
  'cycling',
  'elliptical',
  'rowing',
  'strength',
  'functional',
  'hiit',
  'other',
]);

const SOURCE_SET = new Set<WorkoutSource>([
  'manual',
  'treadmill-scan',
  'imported',
  'estimated',
]);

const INTENSITY_SET = new Set<WorkoutIntensity>(['low', 'moderate', 'high']);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
  );
}

function isValidIsoDatetime(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function safeTrim(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pushRequired(
  issues: WorkoutValidationIssue[],
  field: string,
  value: unknown,
): void {
  if (value === null || value === undefined || value === '') {
    issues.push({
      field,
      code: 'REQUIRED',
      message: `${field} is required.`,
    });
  }
}

function pushRangeIssue(
  issues: WorkoutValidationIssue[],
  field: string,
  value: number,
  min: number,
  max: number,
): void {
  if (value < min || value > max) {
    issues.push({
      field,
      code: 'OUT_OF_RANGE',
      message: `${field} must be between ${min} and ${max}.`,
    });
  }
}

function validateMetrics(metrics: WorkoutMetrics): WorkoutValidationIssue[] {
  const issues: WorkoutValidationIssue[] = [];

  const numericChecks = [
    ['metrics.durationSeconds', metrics.durationSeconds, LIMITS.durationSeconds],
    ['metrics.caloriesKcal', metrics.caloriesKcal, LIMITS.caloriesKcal],
    ['metrics.distanceKm', metrics.distanceKm, LIMITS.distanceKm],
    ['metrics.speedKph', metrics.speedKph, LIMITS.speedKph],
    ['metrics.inclinePercent', metrics.inclinePercent, LIMITS.inclinePercent],
    [
      'metrics.averageHeartRateBpm',
      metrics.averageHeartRateBpm,
      LIMITS.averageHeartRateBpm,
    ],
    ['metrics.steps', metrics.steps, LIMITS.steps],
    ['metrics.reps', metrics.reps, LIMITS.reps],
    ['metrics.sets', metrics.sets, LIMITS.sets],
    ['metrics.weightKg', metrics.weightKg, LIMITS.weightKg],
  ] as const;

  for (const [field, value, range] of numericChecks) {
    if (value === null) {
      continue;
    }

    if (!isFiniteNumber(value)) {
      issues.push({
        field,
        code: 'INVALID_TYPE',
        message: `${field} must be a finite number.`,
      });
      continue;
    }

    pushRangeIssue(issues, field, value, range.min, range.max);
  }

  if (
    metrics.distanceKm !== null &&
    metrics.durationSeconds !== null &&
    metrics.durationSeconds > 0 &&
    metrics.speedKph === null
  ) {
    const derivedSpeed = metrics.distanceKm / (metrics.durationSeconds / 3600);

    if (derivedSpeed > LIMITS.speedKph.max) {
      issues.push({
        field: 'metrics.speedKph',
        code: 'INCONSISTENT_METRICS',
        message: 'Derived speed exceeds supported maximum.',
      });
    }
  }

  if (
    metrics.reps !== null &&
    metrics.sets === null &&
    metrics.reps > 0
  ) {
    issues.push({
      field: 'metrics.sets',
      code: 'INCONSISTENT_METRICS',
      message: 'Sets should be provided when reps are logged.',
    });
  }

  return issues;
}

export function validateWorkoutDraft(
  draft: WorkoutDraft,
): WorkoutValidationResult<WorkoutDraft> {
  const issues: WorkoutValidationIssue[] = [];

  pushRequired(issues, 'kind', draft.kind);
  pushRequired(issues, 'source', draft.source);

  if (draft.date != null && !isValidIsoDate(draft.date)) {
    issues.push({
      field: 'date',
      code: 'INVALID_DATE',
      message: 'date must be a valid ISO date string (YYYY-MM-DD).',
    });
  }

  if (draft.loggedAt != null && !isValidIsoDatetime(draft.loggedAt)) {
    issues.push({
      field: 'loggedAt',
      code: 'INVALID_DATETIME',
      message: 'loggedAt must be a valid ISO datetime string.',
    });
  }

  if (draft.kind != null && !KIND_SET.has(draft.kind)) {
    issues.push({
      field: 'kind',
      code: 'UNSUPPORTED_VALUE',
      message: 'kind is not supported.',
    });
  }

  if (draft.source != null && !SOURCE_SET.has(draft.source)) {
    issues.push({
      field: 'source',
      code: 'UNSUPPORTED_VALUE',
      message: 'source is not supported.',
    });
  }

  if (draft.intensity != null && !INTENSITY_SET.has(draft.intensity)) {
    issues.push({
      field: 'intensity',
      code: 'UNSUPPORTED_VALUE',
      message: 'intensity is not supported.',
    });
  }

  const metricsIssues = validateMetrics({
    durationSeconds: draft.durationSeconds ?? null,
    caloriesKcal: draft.caloriesKcal ?? null,
    distanceKm: draft.distanceKm ?? null,
    speedKph: draft.speedKph ?? null,
    inclinePercent: draft.inclinePercent ?? null,
    averageHeartRateBpm: draft.averageHeartRateBpm ?? null,
    steps: draft.steps ?? null,
    reps: draft.reps ?? null,
    sets: draft.sets ?? null,
    weightKg: draft.weightKg ?? null,
  });

  issues.push(...metricsIssues);

  const title = safeTrim(draft.title);
  if ((title?.length ?? 0) > LIMITS.titleLength.max) {
    issues.push({
      field: 'title',
      code: 'OUT_OF_RANGE',
      message: `title must be at most ${LIMITS.titleLength.max} characters.`,
    });
  }

  const notes = safeTrim(draft.notes);
  if ((notes?.length ?? 0) > LIMITS.notesLength.max) {
    issues.push({
      field: 'notes',
      code: 'OUT_OF_RANGE',
      message: `notes must be at most ${LIMITS.notesLength.max} characters.`,
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      value: null,
      issues,
    };
  }

  return {
    ok: true,
    value: draft,
    issues: [],
  };
}

export function validateWorkoutEntry(
  entry: WorkoutEntry,
): WorkoutValidationResult<WorkoutEntry> {
  const issues: WorkoutValidationIssue[] = [];

  if (!entry.id || entry.id.trim().length === 0) {
    issues.push({
      field: 'id',
      code: 'REQUIRED',
      message: 'id is required.',
    });
  }

  if (!isValidIsoDate(entry.date)) {
    issues.push({
      field: 'date',
      code: 'INVALID_DATE',
      message: 'date must be a valid ISO date string (YYYY-MM-DD).',
    });
  }

  for (const field of ['loggedAt', 'createdAt', 'updatedAt'] as const) {
    if (!isValidIsoDatetime(entry[field])) {
      issues.push({
        field,
        code: 'INVALID_DATETIME',
        message: `${field} must be a valid ISO datetime string.`,
      });
    }
  }

  if (!KIND_SET.has(entry.kind)) {
    issues.push({
      field: 'kind',
      code: 'UNSUPPORTED_VALUE',
      message: 'kind is not supported.',
    });
  }

  if (!SOURCE_SET.has(entry.source)) {
    issues.push({
      field: 'source',
      code: 'UNSUPPORTED_VALUE',
      message: 'source is not supported.',
    });
  }

  if (entry.intensity != null && !INTENSITY_SET.has(entry.intensity)) {
    issues.push({
      field: 'intensity',
      code: 'UNSUPPORTED_VALUE',
      message: 'intensity is not supported.',
    });
  }

  issues.push(...validateMetrics(entry.metrics));

  const title = safeTrim(entry.notes.title);
  if ((title?.length ?? 0) > LIMITS.titleLength.max) {
    issues.push({
      field: 'notes.title',
      code: 'OUT_OF_RANGE',
      message: `notes.title must be at most ${LIMITS.titleLength.max} characters.`,
    });
  }

  const notes = safeTrim(entry.notes.notes);
  if ((notes?.length ?? 0) > LIMITS.notesLength.max) {
    issues.push({
      field: 'notes.notes',
      code: 'OUT_OF_RANGE',
      message: `notes.notes must be at most ${LIMITS.notesLength.max} characters.`,
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      value: null,
      issues,
    };
  }

  return {
    ok: true,
    value: entry,
    issues: [],
  };
}