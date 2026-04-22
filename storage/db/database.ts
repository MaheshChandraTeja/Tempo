import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migration001Init } from '@/storage/db/migrations/001_init';
import { migration002AddScanSession } from '@/storage/db/migrations/002_add_scan_session';
import { migration003AddConfidenceFields } from '@/storage/db/migrations/003_add_confidence_fields';

type Migration = Readonly<{
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}>;

const DATABASE_NAME = 'tempo.db';

const MIGRATIONS: readonly Migration[] = Object.freeze([
  migration001Init,
  migration002AddScanSession,
  migration003AddConfidenceFields,
]);

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function configureDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA synchronous = NORMAL;');
}

async function getUserVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  return row?.user_version ?? 0;
}

async function setUserVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version};`);
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getUserVersion(db);

  const pendingMigrations = MIGRATIONS.filter(
    migration => migration.version > currentVersion,
  ).sort((left, right) => left.version - right.version);

  if (pendingMigrations.length === 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const migration of pendingMigrations) {
      await migration.up(db);
      await setUserVersion(db, migration.version);
    }
  });
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync(DATABASE_NAME);
      await configureDatabase(db);
      await runMigrations(db);
      return db;
    })();
  }

  return databasePromise;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.closeAsync();
  databasePromise = null;
}

export async function withDatabase<T>(
  handler: (db: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  return handler(db);
}