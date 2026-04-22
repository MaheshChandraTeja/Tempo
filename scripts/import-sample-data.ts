import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDemoWorkouts } from '../storage/db/seed/demoWorkouts';
import { ensureDevSchema, openDevDatabase, resetDevDatabase } from './reset-local-db';

type DemoScanCatalog = Readonly<{
  schemaVersion: number;
  samples: Array<{
    id: string;
    fileName: string;
    description: string;
    expectedOcrText: string;
    expectedParsedMetrics: {
      durationSeconds: number | null;
      distanceKm: number | null;
      caloriesKcal: number | null;
      speedKph: number | null;
      inclinePercent: number | null;
    };
    tags: string[];
  }>;
}>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SAMPLE_CATALOG_PATH = path.join(
  PROJECT_ROOT,
  'assets',
  'treadmill-samples',
  'catalog.json',
);

function loadCatalog(): DemoScanCatalog {
  return JSON.parse(fs.readFileSync(SAMPLE_CATALOG_PATH, 'utf8')) as DemoScanCatalog;
}

function rebuildDailySummaries(db: ReturnType<typeof openDevDatabase>): void {
  const rows = db
    .prepare(
      `
      SELECT
        date,
        COUNT(*) as total_workouts,
        COALESCE(SUM(calories_kcal), 0) as total_calories_kcal,
        COALESCE(SUM(duration_seconds), 0) as total_duration_seconds,
        COALESCE(SUM(distance_km), 0) as total_distance_km
      FROM workouts
      GROUP BY date
      ORDER BY date DESC;
      `,
    )
    .all() as Array<{
    date: string;
    total_workouts: number;
    total_calories_kcal: number;
    total_duration_seconds: number;
    total_distance_km: number;
  }>;

  const insert = db.prepare(`
    INSERT INTO daily_summaries (
      date, total_workouts, total_calories_kcal, total_duration_seconds, total_distance_km, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_workouts = excluded.total_workouts,
      total_calories_kcal = excluded.total_calories_kcal,
      total_duration_seconds = excluded.total_duration_seconds,
      total_distance_km = excluded.total_distance_km,
      updated_at = excluded.updated_at;
  `);

  const now = new Date().toISOString();

  db.exec('DELETE FROM daily_summaries;');

  for (const row of rows) {
    insert.run(
      row.date,
      row.total_workouts,
      row.total_calories_kcal,
      row.total_duration_seconds,
      row.total_distance_km,
      now,
      now,
    );
  }
}

function importWorkouts(db: ReturnType<typeof openDevDatabase>): number {
  const workouts = getDemoWorkouts();

  const statement = db.prepare(`
    INSERT INTO workouts (
      id, date, logged_at, kind, source, intensity,
      duration_seconds, calories_kcal, distance_km, speed_kph, incline_percent,
      average_heart_rate_bpm, steps, reps, sets, weight_kg,
      title, notes, is_estimated_calories, source_confidence,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      date = excluded.date,
      logged_at = excluded.logged_at,
      kind = excluded.kind,
      source = excluded.source,
      intensity = excluded.intensity,
      duration_seconds = excluded.duration_seconds,
      calories_kcal = excluded.calories_kcal,
      distance_km = excluded.distance_km,
      speed_kph = excluded.speed_kph,
      incline_percent = excluded.incline_percent,
      average_heart_rate_bpm = excluded.average_heart_rate_bpm,
      steps = excluded.steps,
      reps = excluded.reps,
      sets = excluded.sets,
      weight_kg = excluded.weight_kg,
      title = excluded.title,
      notes = excluded.notes,
      is_estimated_calories = excluded.is_estimated_calories,
      source_confidence = excluded.source_confidence,
      updated_at = excluded.updated_at;
  `);

  for (const entry of workouts) {
    statement.run(
      entry.id,
      entry.date,
      entry.loggedAt,
      entry.kind,
      entry.source,
      entry.intensity,
      entry.metrics.durationSeconds,
      entry.metrics.caloriesKcal,
      entry.metrics.distanceKm,
      entry.metrics.speedKph,
      entry.metrics.inclinePercent,
      entry.metrics.averageHeartRateBpm,
      entry.metrics.steps,
      entry.metrics.reps,
      entry.metrics.sets,
      entry.metrics.weightKg,
      entry.notes.title,
      entry.notes.notes,
      entry.isEstimatedCalories ? 1 : 0,
      null,
      entry.createdAt,
      entry.updatedAt,
    );
  }

  return workouts.length;
}

function importScanSamples(db: ReturnType<typeof openDevDatabase>): number {
  const catalog = loadCatalog();

  const statement = db.prepare(`
    INSERT INTO scan_sessions (
      id, created_at, updated_at, status, raw_text, normalized_text,
      parsed_payload_json, debug_payload_json, image_path, warning_count,
      confidence, saved_workout_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      updated_at = excluded.updated_at,
      status = excluded.status,
      raw_text = excluded.raw_text,
      normalized_text = excluded.normalized_text,
      parsed_payload_json = excluded.parsed_payload_json,
      debug_payload_json = excluded.debug_payload_json,
      image_path = excluded.image_path,
      warning_count = excluded.warning_count,
      confidence = excluded.confidence,
      saved_workout_id = excluded.saved_workout_id;
  `);

  const now = new Date().toISOString();

  for (const sample of catalog.samples) {
    statement.run(
      sample.id,
      now,
      now,
      'reviewing',
      sample.expectedOcrText,
      sample.expectedOcrText,
      JSON.stringify(sample.expectedParsedMetrics),
      JSON.stringify({
        description: sample.description,
        tags: sample.tags,
        fileName: sample.fileName,
      }),
      path.join(PROJECT_ROOT, 'assets', 'treadmill-samples', sample.fileName),
      0,
      0.88,
      null,
    );
  }

  return catalog.samples.length;
}

function main(): void {
  const shouldReset = process.argv.includes('--reset');

  if (shouldReset) {
    resetDevDatabase({ wipeArtifacts: false });
  }

  const db = openDevDatabase();
  ensureDevSchema(db);

  try {
    const workoutCount = importWorkouts(db);
    const scanCount = importScanSamples(db);
    rebuildDailySummaries(db);

    console.log(`[tempo] imported ${workoutCount} demo workouts`);
    console.log(`[tempo] imported ${scanCount} sample scan sessions`);
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error('[tempo] import-sample-data failed');
  console.error(error);
  process.exit(1);
}