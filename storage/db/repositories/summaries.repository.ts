import { getDatabase } from '@/storage/db/database';
import { DAILY_SUMMARIES_TABLE } from '@/storage/db/tables/daily_summaries.table';
import { WORKOUTS_TABLE } from '@/storage/db/tables/workouts.table';

export type DailySummaryRecord = Readonly<{
  date: string;
  totalWorkouts: number;
  totalCaloriesKcal: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  createdAt: string;
  updatedAt: string;
}>;

type DailySummaryRow = Readonly<{
  date: string;
  total_workouts: number;
  total_calories_kcal: number;
  total_duration_seconds: number;
  total_distance_km: number;
  created_at: string;
  updated_at: string;
}>;

function mapRow(row: DailySummaryRow): DailySummaryRecord {
  return {
    date: row.date,
    totalWorkouts: row.total_workouts,
    totalCaloriesKcal: row.total_calories_kcal,
    totalDurationSeconds: row.total_duration_seconds,
    totalDistanceKm: row.total_distance_km,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type SummariesRepository = Readonly<{
  listRecent: (limit?: number) => Promise<DailySummaryRecord[]>;
  getByDate: (date: string) => Promise<DailySummaryRecord | null>;
  rebuildForDate: (date: string) => Promise<void>;
  rebuildAll: () => Promise<void>;
  clear: () => Promise<void>;
}>;

export function createSummariesRepository(): SummariesRepository {
  return Object.freeze({
    async listRecent(limit = 30): Promise<DailySummaryRecord[]> {
      const db = await getDatabase();
      const rows = await db.getAllAsync<DailySummaryRow>(
        `SELECT * FROM ${DAILY_SUMMARIES_TABLE} ORDER BY date DESC LIMIT ?;`,
        limit,
      );

      return rows.map(mapRow);
    },

    async getByDate(date: string): Promise<DailySummaryRecord | null> {
      const db = await getDatabase();
      const row = await db.getFirstAsync<DailySummaryRow>(
        `SELECT * FROM ${DAILY_SUMMARIES_TABLE} WHERE date = ? LIMIT 1;`,
        date,
      );

      return row ? mapRow(row) : null;
    },

    async rebuildForDate(date: string): Promise<void> {
      const db = await getDatabase();
      const now = new Date().toISOString();

      const aggregate = await db.getFirstAsync<{
        total_workouts: number;
        total_calories_kcal: number;
        total_duration_seconds: number;
        total_distance_km: number;
      }>(
        `
        SELECT
          COUNT(*) as total_workouts,
          COALESCE(SUM(calories_kcal), 0) as total_calories_kcal,
          COALESCE(SUM(duration_seconds), 0) as total_duration_seconds,
          COALESCE(SUM(distance_km), 0) as total_distance_km
        FROM ${WORKOUTS_TABLE}
        WHERE date = ?;
        `,
        date,
      );

      await db.runAsync(
        `
        INSERT INTO ${DAILY_SUMMARIES_TABLE} (
          date, total_workouts, total_calories_kcal, total_duration_seconds, total_distance_km, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          total_workouts = excluded.total_workouts,
          total_calories_kcal = excluded.total_calories_kcal,
          total_duration_seconds = excluded.total_duration_seconds,
          total_distance_km = excluded.total_distance_km,
          updated_at = excluded.updated_at;
        `,
        date,
        aggregate?.total_workouts ?? 0,
        aggregate?.total_calories_kcal ?? 0,
        aggregate?.total_duration_seconds ?? 0,
        aggregate?.total_distance_km ?? 0,
        now,
        now,
      );
    },

    async rebuildAll(): Promise<void> {
      const db = await getDatabase();
      const dates = await db.getAllAsync<{ date: string }>(
        `SELECT DISTINCT date FROM ${WORKOUTS_TABLE} ORDER BY date DESC;`,
      );

      await db.execAsync(`DELETE FROM ${DAILY_SUMMARIES_TABLE};`);

      for (const row of dates) {
        await this.rebuildForDate(row.date);
      }
    },

    async clear(): Promise<void> {
      const db = await getDatabase();
      await db.execAsync(`DELETE FROM ${DAILY_SUMMARIES_TABLE};`);
    },
  });
}

let summariesRepositorySingleton: SummariesRepository | null = null;

export function getSummariesRepository(): SummariesRepository {
  if (!summariesRepositorySingleton) {
    summariesRepositorySingleton = createSummariesRepository();
  }

  return summariesRepositorySingleton;
}