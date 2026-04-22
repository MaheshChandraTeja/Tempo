export type WorkoutId = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export type WorkoutKind =
  | 'treadmill'
  | 'outdoor-walk'
  | 'outdoor-run'
  | 'cycling'
  | 'elliptical'
  | 'rowing'
  | 'strength'
  | 'functional'
  | 'hiit'
  | 'other';

export type WorkoutSource =
  | 'manual'
  | 'treadmill-scan'
  | 'imported'
  | 'estimated';

export type WorkoutIntensity = 'low' | 'moderate' | 'high';

export type DistanceUnit = 'km';
export type WeightUnit = 'kg';
export type EnergyUnit = 'kcal';

export type WorkoutMetrics = Readonly<{
  durationSeconds: number | null;
  caloriesKcal: number | null;
  distanceKm: number | null;
  speedKph: number | null;
  inclinePercent: number | null;
  averageHeartRateBpm: number | null;
  steps: number | null;
  reps: number | null;
  sets: number | null;
  weightKg: number | null;
}>;

export type WorkoutNotes = Readonly<{
  title: string | null;
  notes: string | null;
}>;

export type WorkoutAudit = Readonly<{
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}>;

export type WorkoutEntry = Readonly<{
  id: WorkoutId;
  date: ISODateString;
  loggedAt: ISODateTimeString;
  kind: WorkoutKind;
  source: WorkoutSource;
  intensity: WorkoutIntensity | null;
  metrics: WorkoutMetrics;
  notes: WorkoutNotes;
  isEstimatedCalories: boolean;
}> &
  WorkoutAudit;

export type WorkoutDraft = Readonly<{
  id?: WorkoutId;
  date?: ISODateString | null;
  loggedAt?: ISODateTimeString | null;
  kind?: WorkoutKind | null;
  source?: WorkoutSource | null;
  intensity?: WorkoutIntensity | null;
  durationSeconds?: number | null;
  caloriesKcal?: number | null;
  distanceKm?: number | null;
  speedKph?: number | null;
  inclinePercent?: number | null;
  averageHeartRateBpm?: number | null;
  steps?: number | null;
  reps?: number | null;
  sets?: number | null;
  weightKg?: number | null;
  title?: string | null;
  notes?: string | null;
}>;

export type WorkoutValidationErrorCode =
  | 'REQUIRED'
  | 'INVALID_TYPE'
  | 'INVALID_DATE'
  | 'INVALID_DATETIME'
  | 'OUT_OF_RANGE'
  | 'INCONSISTENT_METRICS'
  | 'UNSUPPORTED_VALUE';

export type WorkoutValidationIssue = Readonly<{
  field: string;
  code: WorkoutValidationErrorCode;
  message: string;
}>;

export type WorkoutValidationResult<T> =
  | Readonly<{
      ok: true;
      value: T;
      issues: [];
    }>
  | Readonly<{
      ok: false;
      value: null;
      issues: WorkoutValidationIssue[];
    }>;

export type CalorieEstimateInput = Readonly<{
  kind: WorkoutKind;
  durationSeconds: number | null;
  distanceKm?: number | null;
  speedKph?: number | null;
  inclinePercent?: number | null;
  intensity?: WorkoutIntensity | null;
  weightKg?: number | null;
}>;

export type CalorieEstimateResult = Readonly<{
  caloriesKcal: number;
  method: 'distance-based' | 'met-based' | 'fallback';
  confidence: 'low' | 'medium' | 'high';
}>;

export const WORKOUT_KINDS = Object.freeze<WorkoutKind[]>([
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

export const WORKOUT_SOURCES = Object.freeze<WorkoutSource[]>([
  'manual',
  'treadmill-scan',
  'imported',
  'estimated',
]);

export const WORKOUT_INTENSITIES = Object.freeze<WorkoutIntensity[]>([
  'low',
  'moderate',
  'high',
]);