import * as FileSystem from 'expo-file-system/legacy';

import type { WorkoutEntry } from '@/features/workout-log/domain/workout.types';
import { exportScansCsv, exportSummariesCsv, exportWorkoutsCsv } from '@/modules/export/csvExport';
import {
  buildTempoJsonExport,
  stringifyTempoJsonExport,
  type TempoJsonExport,
} from '@/modules/export/jsonExport';
import type { ScanSessionRecord } from '@/storage/db/repositories/scans.repository';
import type { DailySummaryRecord } from '@/storage/db/repositories/summaries.repository';

export type BackupBundleManifest = Readonly<{
  schemaVersion: 1;
  createdAt: string;
  files: ReadonlyArray<{
    name: string;
    path: string;
    mimeType: string;
  }>;
}>;

export type BackupBundleResult = Readonly<{
  directoryPath: string;
  manifestPath: string;
  manifest: BackupBundleManifest;
}>;

const BACKUP_DIR = `${FileSystem.documentDirectory}tempo/backups/`;

async function ensureDirectory(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

function buildTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export async function createBackupBundle(input: Readonly<{
  workouts: WorkoutEntry[];
  summaries: DailySummaryRecord[];
  scans?: ScanSessionRecord[];
  includeScans?: boolean;
}>): Promise<BackupBundleResult> {
  await ensureDirectory(BACKUP_DIR);

  const timestamp = buildTimestamp();
  const bundleDir = `${BACKUP_DIR}tempo-backup-${timestamp}/`;

  await ensureDirectory(bundleDir);

  const jsonPayload: TempoJsonExport = buildTempoJsonExport({
    workouts: input.workouts,
    summaries: input.summaries,
    ...(input.includeScans ? { scans: input.scans ?? [] } : {}),
  });

  const files: Array<{
    name: string;
    path: string;
    mimeType: string;
  }> = [];

  const jsonPath = `${bundleDir}backup.json`;
  await FileSystem.writeAsStringAsync(jsonPath, stringifyTempoJsonExport(jsonPayload), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  files.push({
    name: 'backup.json',
    path: jsonPath,
    mimeType: 'application/json',
  });

  const workoutsCsvPath = `${bundleDir}workouts.csv`;
  await FileSystem.writeAsStringAsync(workoutsCsvPath, exportWorkoutsCsv(input.workouts), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  files.push({
    name: 'workouts.csv',
    path: workoutsCsvPath,
    mimeType: 'text/csv',
  });

  const summariesCsvPath = `${bundleDir}summaries.csv`;
  await FileSystem.writeAsStringAsync(summariesCsvPath, exportSummariesCsv(input.summaries), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  files.push({
    name: 'summaries.csv',
    path: summariesCsvPath,
    mimeType: 'text/csv',
  });

  if (input.includeScans && input.scans) {
    const scansCsvPath = `${bundleDir}scans.csv`;
    await FileSystem.writeAsStringAsync(scansCsvPath, exportScansCsv(input.scans), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    files.push({
      name: 'scans.csv',
      path: scansCsvPath,
      mimeType: 'text/csv',
    });
  }

  const manifest: BackupBundleManifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    files,
  };

  const manifestPath = `${bundleDir}manifest.json`;
  await FileSystem.writeAsStringAsync(manifestPath, JSON.stringify(manifest, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    directoryPath: bundleDir,
    manifestPath,
    manifest,
  };
}