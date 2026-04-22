import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import type { ScanSessionRecord } from '@/storage/db/repositories/scans.repository';
import type { DailySummaryRecord } from '@/storage/db/repositories/summaries.repository';

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value == null) {
    return '';
  }

  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function toCsv<T extends Record<string, unknown>>(
  rows: readonly T[],
  columns: readonly (keyof T)[],
): string {
  const header = columns.map(column => escapeCsvValue(String(column))).join(',');

  const body = rows.map(row =>
    columns.map(column => escapeCsvValue(row[column] as string | number | boolean | null | undefined)).join(','),
  );

  return [header, ...body].join('\n');
}

type WorkoutCsvRow = Readonly<{
  id: string;
  date: string;
  loggedAt: string;
  kind: string;
  source: string;
  intensity: string | null;
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
  title: string | null;
  notes: string | null;
  isEstimatedCalories: boolean;
  createdAt: string;
  updatedAt: string;
}>;

type SummaryCsvRow = Readonly<{
  date: string;
  totalWorkouts: number;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  createdAt: string;
  updatedAt: string;
}>;

type ScanCsvRow = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  warningCount: number;
  confidence: number | null;
  imagePath: string | null;
  savedWorkoutId: string | null;
}>;

function mapWorkoutToCsvRow(entry: WorkoutEntry): WorkoutCsvRow {
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
    isEstimatedCalories: entry.isEstimatedCalories,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function mapSummaryToCsvRow(summary: DailySummaryRecord): SummaryCsvRow {
  return {
    date: summary.date,
    totalWorkouts: summary.totalWorkouts,
    totalCaloriesKcal: summary.totalCaloriesKcal,
    totalDurationSeconds: summary.totalDurationSeconds,
    totalDistanceKm: summary.totalDistanceKm,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  };
}

function mapScanToCsvRow(scan: ScanSessionRecord): ScanCsvRow {
  return {
    id: scan.id,
    createdAt: scan.createdAt,
    updatedAt: scan.updatedAt,
    status: scan.status,
    warningCount: scan.warningCount,
    confidence: scan.confidence,
    imagePath: scan.imagePath,
    savedWorkoutId: scan.savedWorkoutId,
  };
}

export function exportWorkoutsCsv(entries: readonly WorkoutEntry[]): string {
  const rows = entries.map(mapWorkoutToCsvRow);

  return toCsv(rows, [
    'id',
    'date',
    'loggedAt',
    'kind',
    'source',
    'intensity',
    'durationSeconds',
    'caloriesKcal',
    'distanceKm',
    'speedKph',
    'inclinePercent',
    'averageHeartRateBpm',
    'steps',
    'reps',
    'sets',
    'weightKg',
    'title',
    'notes',
    'isEstimatedCalories',
    'createdAt',
    'updatedAt',
  ]);
}

export function exportSummariesCsv(
  summaries: readonly DailySummaryRecord[],
): string {
  const rows = summaries.map(mapSummaryToCsvRow);

  return toCsv(rows, [
    'date',
    'totalWorkouts',
    'totalCaloriesKcal',
    'totalDurationSeconds',
    'totalDistanceKm',
    'createdAt',
    'updatedAt',
  ]);
}

export function exportScansCsv(
  scans: readonly ScanSessionRecord[],
): string {
  const rows = scans.map(mapScanToCsvRow);

  return toCsv(rows, [
    'id',
    'createdAt',
    'updatedAt',
    'status',
    'warningCount',
    'confidence',
    'imagePath',
    'savedWorkoutId',
  ]);
}