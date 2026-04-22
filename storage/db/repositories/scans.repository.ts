import { getDatabase } from '@/storage/db/database';
import { SCAN_SESSIONS_TABLE } from '@/storage/db/tables/scan_sessions.table';

export type ScanSessionRecord = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  rawText: string | null;
  normalizedText: string | null;
  parsedPayloadJson: string | null;
  debugPayloadJson: string | null;
  imagePath: string | null;
  warningCount: number;
  confidence: number | null;
  savedWorkoutId: string | null;
}>;

type ScanSessionRow = Readonly<{
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  raw_text: string | null;
  normalized_text: string | null;
  parsed_payload_json: string | null;
  debug_payload_json: string | null;
  image_path: string | null;
  warning_count: number;
  confidence: number | null;
  saved_workout_id: string | null;
}>;

function mapRow(row: ScanSessionRow): ScanSessionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    rawText: row.raw_text,
    normalizedText: row.normalized_text,
    parsedPayloadJson: row.parsed_payload_json,
    debugPayloadJson: row.debug_payload_json,
    imagePath: row.image_path,
    warningCount: row.warning_count,
    confidence: row.confidence,
    savedWorkoutId: row.saved_workout_id,
  };
}

export type ScansRepository = Readonly<{
  listRecent: (limit?: number) => Promise<ScanSessionRecord[]>;
  getById: (id: string) => Promise<ScanSessionRecord | null>;
  upsert: (record: ScanSessionRecord) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}>;

export function createScansRepository(): ScansRepository {
  return Object.freeze({
    async listRecent(limit = 20): Promise<ScanSessionRecord[]> {
      const db = await getDatabase();
      const rows = await db.getAllAsync<ScanSessionRow>(
        `SELECT * FROM ${SCAN_SESSIONS_TABLE} ORDER BY created_at DESC LIMIT ?;`,
        limit,
      );

      return rows.map(mapRow);
    },

    async getById(id: string): Promise<ScanSessionRecord | null> {
      const db = await getDatabase();
      const row = await db.getFirstAsync<ScanSessionRow>(
        `SELECT * FROM ${SCAN_SESSIONS_TABLE} WHERE id = ? LIMIT 1;`,
        id,
      );

      return row ? mapRow(row) : null;
    },

    async upsert(record: ScanSessionRecord): Promise<void> {
      const db = await getDatabase();

      await db.runAsync(
        `
        INSERT INTO ${SCAN_SESSIONS_TABLE} (
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
        `,
        record.id,
        record.createdAt,
        record.updatedAt,
        record.status,
        record.rawText,
        record.normalizedText,
        record.parsedPayloadJson,
        record.debugPayloadJson,
        record.imagePath,
        record.warningCount,
        record.confidence,
        record.savedWorkoutId,
      );
    },

    async remove(id: string): Promise<void> {
      const db = await getDatabase();
      await db.runAsync(`DELETE FROM ${SCAN_SESSIONS_TABLE} WHERE id = ?;`, id);
    },

    async clear(): Promise<void> {
      const db = await getDatabase();
      await db.execAsync(`DELETE FROM ${SCAN_SESSIONS_TABLE};`);
    },
  });
}

let scansRepositorySingleton: ScansRepository | null = null;

export function getScansRepository(): ScansRepository {
  if (!scansRepositorySingleton) {
    scansRepositorySingleton = createScansRepository();
  }

  return scansRepositorySingleton;
}