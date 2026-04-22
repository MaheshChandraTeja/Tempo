import { SCAN_SESSIONS_TABLE, scanSessionsColumns } from '@/storage/db/tables/scan_sessions.table';
import { WORKOUTS_TABLE, workoutsTableColumns } from '@/storage/db/tables/workouts.table';
import type { SQLiteDatabase } from 'expo-sqlite';

async function addColumnIfMissing(
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
  columnSql: string,
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
  const exists = columns.some(column => column.name === columnName);

  if (!exists) {
    await db.execAsync(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnSql};`,
    );
  }
}

export const migration003AddConfidenceFields = Object.freeze({
  version: 3,
  name: '003_add_confidence_fields',
  async up(db: SQLiteDatabase): Promise<void> {
    await addColumnIfMissing(
      db,
      SCAN_SESSIONS_TABLE,
      scanSessionsColumns.confidence,
      'REAL',
    );

    await addColumnIfMissing(
      db,
      WORKOUTS_TABLE,
      workoutsTableColumns.sourceConfidence,
      'REAL',
    );
  },
});