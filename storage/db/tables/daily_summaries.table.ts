export const DAILY_SUMMARIES_TABLE = 'daily_summaries';

export const dailySummariesColumns = Object.freeze({
  date: 'date',
  totalWorkouts: 'total_workouts',
  totalCaloriesKcal: 'total_calories_kcal',
  totalDurationSeconds: 'total_duration_seconds',
  totalDistanceKm: 'total_distance_km',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export const CREATE_DAILY_SUMMARIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${DAILY_SUMMARIES_TABLE} (
  ${dailySummariesColumns.date} TEXT PRIMARY KEY NOT NULL,
  ${dailySummariesColumns.totalWorkouts} INTEGER NOT NULL DEFAULT 0,
  ${dailySummariesColumns.totalCaloriesKcal} REAL NOT NULL DEFAULT 0,
  ${dailySummariesColumns.totalDurationSeconds} INTEGER NOT NULL DEFAULT 0,
  ${dailySummariesColumns.totalDistanceKm} REAL NOT NULL DEFAULT 0,
  ${dailySummariesColumns.createdAt} TEXT NOT NULL,
  ${dailySummariesColumns.updatedAt} TEXT NOT NULL
);
`;

export const CREATE_DAILY_SUMMARIES_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_daily_summaries_updated_at ON ${DAILY_SUMMARIES_TABLE} (${dailySummariesColumns.updatedAt});`,
] as const;