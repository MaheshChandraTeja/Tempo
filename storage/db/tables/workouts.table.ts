export const WORKOUTS_TABLE = 'workouts';

export const workoutsTableColumns = Object.freeze({
  id: 'id',
  date: 'date',
  loggedAt: 'logged_at',
  kind: 'kind',
  source: 'source',
  intensity: 'intensity',
  durationSeconds: 'duration_seconds',
  caloriesKcal: 'calories_kcal',
  distanceKm: 'distance_km',
  speedKph: 'speed_kph',
  inclinePercent: 'incline_percent',
  averageHeartRateBpm: 'average_heart_rate_bpm',
  steps: 'steps',
  reps: 'reps',
  sets: 'sets',
  weightKg: 'weight_kg',
  title: 'title',
  notes: 'notes',
  isEstimatedCalories: 'is_estimated_calories',
  sourceConfidence: 'source_confidence',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export const CREATE_WORKOUTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${WORKOUTS_TABLE} (
  ${workoutsTableColumns.id} TEXT PRIMARY KEY NOT NULL,
  ${workoutsTableColumns.date} TEXT NOT NULL,
  ${workoutsTableColumns.loggedAt} TEXT NOT NULL,
  ${workoutsTableColumns.kind} TEXT NOT NULL,
  ${workoutsTableColumns.source} TEXT NOT NULL,
  ${workoutsTableColumns.intensity} TEXT,
  ${workoutsTableColumns.durationSeconds} INTEGER,
  ${workoutsTableColumns.caloriesKcal} REAL,
  ${workoutsTableColumns.distanceKm} REAL,
  ${workoutsTableColumns.speedKph} REAL,
  ${workoutsTableColumns.inclinePercent} REAL,
  ${workoutsTableColumns.averageHeartRateBpm} INTEGER,
  ${workoutsTableColumns.steps} INTEGER,
  ${workoutsTableColumns.reps} INTEGER,
  ${workoutsTableColumns.sets} INTEGER,
  ${workoutsTableColumns.weightKg} REAL,
  ${workoutsTableColumns.title} TEXT,
  ${workoutsTableColumns.notes} TEXT,
  ${workoutsTableColumns.isEstimatedCalories} INTEGER NOT NULL DEFAULT 0,
  ${workoutsTableColumns.sourceConfidence} REAL,
  ${workoutsTableColumns.createdAt} TEXT NOT NULL,
  ${workoutsTableColumns.updatedAt} TEXT NOT NULL
);
`;

export const CREATE_WORKOUTS_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_workouts_date ON ${WORKOUTS_TABLE} (${workoutsTableColumns.date});`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_logged_at ON ${WORKOUTS_TABLE} (${workoutsTableColumns.loggedAt});`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_source ON ${WORKOUTS_TABLE} (${workoutsTableColumns.source});`,
] as const;