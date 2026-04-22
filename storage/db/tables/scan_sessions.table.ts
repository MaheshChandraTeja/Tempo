export const SCAN_SESSIONS_TABLE = 'scan_sessions';

export const scanSessionsColumns = Object.freeze({
  id: 'id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  status: 'status',
  rawText: 'raw_text',
  normalizedText: 'normalized_text',
  parsedPayloadJson: 'parsed_payload_json',
  debugPayloadJson: 'debug_payload_json',
  imagePath: 'image_path',
  warningCount: 'warning_count',
  confidence: 'confidence',
  savedWorkoutId: 'saved_workout_id',
});

export const CREATE_SCAN_SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${SCAN_SESSIONS_TABLE} (
  ${scanSessionsColumns.id} TEXT PRIMARY KEY NOT NULL,
  ${scanSessionsColumns.createdAt} TEXT NOT NULL,
  ${scanSessionsColumns.updatedAt} TEXT NOT NULL,
  ${scanSessionsColumns.status} TEXT NOT NULL,
  ${scanSessionsColumns.rawText} TEXT,
  ${scanSessionsColumns.normalizedText} TEXT,
  ${scanSessionsColumns.parsedPayloadJson} TEXT,
  ${scanSessionsColumns.debugPayloadJson} TEXT,
  ${scanSessionsColumns.imagePath} TEXT,
  ${scanSessionsColumns.warningCount} INTEGER NOT NULL DEFAULT 0,
  ${scanSessionsColumns.confidence} REAL,
  ${scanSessionsColumns.savedWorkoutId} TEXT
);
`;

export const CREATE_SCAN_SESSIONS_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_scan_sessions_created_at ON ${SCAN_SESSIONS_TABLE} (${scanSessionsColumns.createdAt});`,
  `CREATE INDEX IF NOT EXISTS idx_scan_sessions_status ON ${SCAN_SESSIONS_TABLE} (${scanSessionsColumns.status});`,
] as const;