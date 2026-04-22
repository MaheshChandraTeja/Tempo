import {
    CREATE_APP_SETTINGS_INDEXES_SQL,
    CREATE_APP_SETTINGS_TABLE_SQL,
} from '@/storage/db/tables/app_settings.table';
import {
    CREATE_DAILY_SUMMARIES_INDEXES_SQL,
    CREATE_DAILY_SUMMARIES_TABLE_SQL,
} from '@/storage/db/tables/daily_summaries.table';
import {
    CREATE_WORKOUTS_INDEXES_SQL,
    CREATE_WORKOUTS_TABLE_SQL,
} from '@/storage/db/tables/workouts.table';
import type { SQLiteDatabase } from 'expo-sqlite';

export const migration001Init = Object.freeze({
  version: 1,
  name: '001_init',
  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(CREATE_WORKOUTS_TABLE_SQL);
    await db.execAsync(CREATE_DAILY_SUMMARIES_TABLE_SQL);
    await db.execAsync(CREATE_APP_SETTINGS_TABLE_SQL);

    for (const statement of CREATE_WORKOUTS_INDEXES_SQL) {
      await db.execAsync(statement);
    }

    for (const statement of CREATE_DAILY_SUMMARIES_INDEXES_SQL) {
      await db.execAsync(statement);
    }

    for (const statement of CREATE_APP_SETTINGS_INDEXES_SQL) {
      await db.execAsync(statement);
    }
  },
});