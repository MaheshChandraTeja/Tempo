import type { WorkoutEntry, WorkoutId } from '@/features/workout-log/domain/workout.types';
import { getDatabase } from '@/storage/db/database';
import { WORKOUTS_TABLE } from '@/storage/db/tables/workouts.table';

type WorkoutRow = Readonly<{
  id: string;
  date: string;
  logged_at: string;
  kind: string;
  source: string;
  intensity: string | null;
  duration_seconds: number | null;
  calories_kcal: number | null;
  distance_km: number | null;
  speed_kph: number | null;
  incline_percent: number | null;
  average_heart_rate_bpm: number | null;
  steps: number | null;
  reps: number | null;
  sets: number | null;
  weight_kg: number | null;
  title: string | null;
  notes: string | null;
  is_estimated_calories: number;
  source_confidence: number | null;
  created_at: string;
  updated_at: string;
}>;

function mapRowToWorkoutEntry(row: WorkoutRow): WorkoutEntry {
  return {
    id: row.id,
    date: row.date,
    loggedAt: row.logged_at,
    kind: row.kind as WorkoutEntry['kind'],
    source: row.source as WorkoutEntry['source'],
    intensity: (row.intensity as WorkoutEntry['intensity']) ?? null,
    metrics: {
      durationSeconds: row.duration_seconds,
      caloriesKcal: row.calories_kcal,
      distanceKm: row.distance_km,
      speedKph: row.speed_kph,
      inclinePercent: row.incline_percent,
      averageHeartRateBpm: row.average_heart_rate_bpm,
      steps: row.steps,
      reps: row.reps,
      sets: row.sets,
      weightKg: row.weight_kg,
    },
    notes: {
      title: row.title,
      notes: row.notes,
    },
    isEstimatedCalories: row.is_estimated_calories === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEntryToParams(entry: WorkoutEntry): Array<string | number | null> {
  return [
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
  ];
}

export type WorkoutsRepository = Readonly<{
  listAll: () => Promise<WorkoutEntry[]>;
  listByDate: (date: string) => Promise<WorkoutEntry[]>;
  getById: (id: WorkoutId) => Promise<WorkoutEntry | null>;
  upsert: (entry: WorkoutEntry) => Promise<void>;
  remove: (id: WorkoutId) => Promise<void>;
  clear: () => Promise<void>;
  count: () => Promise<number>;
}>;

export function createWorkoutsRepository(): WorkoutsRepository {
  return Object.freeze({
    async listAll(): Promise<WorkoutEntry[]> {
      const db = await getDatabase();
      const rows = await db.getAllAsync<WorkoutRow>(
        `SELECT * FROM ${WORKOUTS_TABLE} ORDER BY logged_at DESC;`,
      );

      return rows.map(mapRowToWorkoutEntry);
    },

    async listByDate(date: string): Promise<WorkoutEntry[]> {
      const db = await getDatabase();
      const rows = await db.getAllAsync<WorkoutRow>(
        `SELECT * FROM ${WORKOUTS_TABLE} WHERE date = ? ORDER BY logged_at DESC;`,
        date,
      );

      return rows.map(mapRowToWorkoutEntry);
    },

    async getById(id: WorkoutId): Promise<WorkoutEntry | null> {
      const db = await getDatabase();
      const row = await db.getFirstAsync<WorkoutRow>(
        `SELECT * FROM ${WORKOUTS_TABLE} WHERE id = ? LIMIT 1;`,
        id,
      );

      return row ? mapRowToWorkoutEntry(row) : null;
    },

    async upsert(entry: WorkoutEntry): Promise<void> {
      const db = await getDatabase();
      const params = mapEntryToParams(entry);

      await db.runAsync(
        `
        INSERT INTO ${WORKOUTS_TABLE} (
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
        `,
        ...params,
      );
    },

    async remove(id: WorkoutId): Promise<void> {
      const db = await getDatabase();
      await db.runAsync(`DELETE FROM ${WORKOUTS_TABLE} WHERE id = ?;`, id);
    },

    async clear(): Promise<void> {
      const db = await getDatabase();
      await db.execAsync(`DELETE FROM ${WORKOUTS_TABLE};`);
    },

    async count(): Promise<number> {
      const db = await getDatabase();
      const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${WORKOUTS_TABLE};`,
      );

      return row?.total ?? 0;
    },
  });
}

let workoutsRepositorySingleton: WorkoutsRepository | null = null;

export function getWorkoutsRepository(): WorkoutsRepository {
  if (!workoutsRepositorySingleton) {
    workoutsRepositorySingleton = createWorkoutsRepository();
  }

  return workoutsRepositorySingleton;
}