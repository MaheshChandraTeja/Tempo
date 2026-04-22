import {
    CREATE_SCAN_SESSIONS_INDEXES_SQL,
    CREATE_SCAN_SESSIONS_TABLE_SQL,
} from '@/storage/db/tables/scan_sessions.table';
import type { SQLiteDatabase } from 'expo-sqlite';

export const migration002AddScanSession = Object.freeze({
  version: 2,
  name: '002_add_scan_session',
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(CREATE_SCAN_SESSIONS_TABLE_SQL);

    for (const statement of CREATE_SCAN_SESSIONS_INDEXES_SQL) {
      await db.execAsync(statement);
    }
  },
});