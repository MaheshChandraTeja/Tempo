import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import type { ScanSessionRecord } from '@/storage/db/repositories/scans.repository';
import type { DailySummaryRecord } from '@/storage/db/repositories/summaries.repository';

export type TempoJsonExport = Readonly<{
  schemaVersion: 1;
  exportedAt: string;
  source: 'tempo-local-export';
  workouts: WorkoutEntry[];
  summaries: DailySummaryRecord[];
  scans?: ScanSessionRecord[];
}>;

export function buildTempoJsonExport(input: Readonly<{
  workouts: WorkoutEntry[];
  summaries: DailySummaryRecord[];
  scans?: ScanSessionRecord[];
}>): TempoJsonExport {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: 'tempo-local-export',
    workouts: [...input.workouts],
    summaries: [...input.summaries],
    ...(input.scans ? { scans: [...input.scans] } : {}),
  };
}

export function stringifyTempoJsonExport(
  payload: TempoJsonExport,
): string {
  return JSON.stringify(payload, null, 2);
}