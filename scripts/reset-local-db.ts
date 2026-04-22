import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Database from 'better-sqlite3';

import {
    CREATE_APP_SETTINGS_INDEXES_SQL,
    CREATE_APP_SETTINGS_TABLE_SQL,
} from '../storage/db/tables/app_settings.table';
import {
    CREATE_DAILY_SUMMARIES_INDEXES_SQL,
    CREATE_DAILY_SUMMARIES_TABLE_SQL,
} from '../storage/db/tables/daily_summaries.table';
import {
    CREATE_SCAN_SESSIONS_INDEXES_SQL,
    CREATE_SCAN_SESSIONS_TABLE_SQL,
} from '../storage/db/tables/scan_sessions.table';
import {
    CREATE_WORKOUTS_INDEXES_SQL,
    CREATE_WORKOUTS_TABLE_SQL,
} from '../storage/db/tables/workouts.table';

type BetterSqliteDb = InstanceType<typeof Database>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

export const DEV_ROOT_DIR = path.join(PROJECT_ROOT, '.tempo-dev');
export const DEV_DB_DIR = path.join(DEV_ROOT_DIR, 'db');
export const DEV_DB_PATH = path.join(DEV_DB_DIR, 'tempo.dev.sqlite');
export const DEV_DEBUG_DIR = path.join(DEV_ROOT_DIR, 'debug-artifacts');
export const DEV_EXPORTS_DIR = path.join(DEV_ROOT_DIR, 'exports');
export const DEV_BUNDLES_DIR = path.join(DEV_ROOT_DIR, 'bundles');

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDirIfExists(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function removeFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
}

function applyStatements(db: BetterSqliteDb, statements: readonly string[]): void {
  for (const statement of statements) {
    db.exec(statement);
  }
}

export function openDevDatabase(dbPath = DEV_DB_PATH): BetterSqliteDb {
  ensureDir(path.dirname(dbPath));
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  return db;
}

export function ensureDevSchema(db: BetterSqliteDb): void {
  db.exec(CREATE_WORKOUTS_TABLE_SQL);
  db.exec(CREATE_DAILY_SUMMARIES_TABLE_SQL);
  db.exec(CREATE_SCAN_SESSIONS_TABLE_SQL);
  db.exec(CREATE_APP_SETTINGS_TABLE_SQL);

  applyStatements(db, CREATE_WORKOUTS_INDEXES_SQL);
  applyStatements(db, CREATE_DAILY_SUMMARIES_INDEXES_SQL);
  applyStatements(db, CREATE_SCAN_SESSIONS_INDEXES_SQL);
  applyStatements(db, CREATE_APP_SETTINGS_INDEXES_SQL);
}

export function resetDevDatabase(options?: Readonly<{ wipeArtifacts?: boolean }>): void {
  ensureDir(DEV_ROOT_DIR);
  ensureDir(DEV_DB_DIR);

  removeFileIfExists(DEV_DB_PATH);

  if (options?.wipeArtifacts) {
    removeDirIfExists(DEV_DEBUG_DIR);
    removeDirIfExists(DEV_EXPORTS_DIR);
    removeDirIfExists(DEV_BUNDLES_DIR);
  }

  ensureDir(DEV_DEBUG_DIR);
  ensureDir(DEV_EXPORTS_DIR);
  ensureDir(DEV_BUNDLES_DIR);

  const db = openDevDatabase();
  ensureDevSchema(db);
  db.close();
}

function main(): void {
  const wipeArtifacts = process.argv.includes('--wipe-artifacts');

  resetDevDatabase({ wipeArtifacts });

  console.log(`[tempo] reset local dev DB at ${DEV_DB_PATH}`);
  if (wipeArtifacts) {
    console.log('[tempo] wiped local dev debug/export/bundle directories');
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (__filename === invokedPath) {
  try {
    main();
  } catch (error) {
    console.error('[tempo] reset-local-db failed');
    console.error(error);
    process.exit(1);
  }
}