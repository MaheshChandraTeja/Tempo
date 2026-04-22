import { getDatabase } from '@/storage/db/database';
import { APP_SETTINGS_TABLE } from '@/storage/db/tables/app_settings.table';

export type SettingsRepository = Readonly<{
  getString: (key: string) => Promise<string | null>;
  setString: (key: string, value: string | null) => Promise<void>;
  getBoolean: (key: string) => Promise<boolean | null>;
  setBoolean: (key: string, value: boolean) => Promise<void>;
  getNumber: (key: string) => Promise<number | null>;
  setNumber: (key: string, value: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  listAll: () => Promise<Record<string, string | null>>;
  clear: () => Promise<void>;
}>;

export function createSettingsRepository(): SettingsRepository {
  return Object.freeze({
    async getString(key: string): Promise<string | null> {
      const db = await getDatabase();
      const row = await db.getFirstAsync<{ setting_value: string | null }>(
        `SELECT setting_value FROM ${APP_SETTINGS_TABLE} WHERE setting_key = ? LIMIT 1;`,
        key,
      );

      return row?.setting_value ?? null;
    },

    async setString(key: string, value: string | null): Promise<void> {
      const db = await getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        `
        INSERT INTO ${APP_SETTINGS_TABLE} (setting_key, setting_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          updated_at = excluded.updated_at;
        `,
        key,
        value,
        now,
      );
    },

    async getBoolean(key: string): Promise<boolean | null> {
      const value = await this.getString(key);

      if (value == null) {
        return null;
      }

      return value === 'true';
    },

    async setBoolean(key: string, value: boolean): Promise<void> {
      await this.setString(key, String(value));
    },

    async getNumber(key: string): Promise<number | null> {
      const value = await this.getString(key);

      if (value == null) {
        return null;
      }

      const parsed = Number(value);

      return Number.isFinite(parsed) ? parsed : null;
    },

    async setNumber(key: string, value: number): Promise<void> {
      await this.setString(key, String(value));
    },

    async remove(key: string): Promise<void> {
      const db = await getDatabase();
      await db.runAsync(
        `DELETE FROM ${APP_SETTINGS_TABLE} WHERE setting_key = ?;`,
        key,
      );
    },

    async listAll(): Promise<Record<string, string | null>> {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{
        setting_key: string;
        setting_value: string | null;
      }>(`SELECT setting_key, setting_value FROM ${APP_SETTINGS_TABLE};`);

      return rows.reduce<Record<string, string | null>>((accumulator, row) => {
        accumulator[row.setting_key] = row.setting_value;
        return accumulator;
      }, {});
    },

    async clear(): Promise<void> {
      const db = await getDatabase();
      await db.execAsync(`DELETE FROM ${APP_SETTINGS_TABLE};`);
    },
  });
}

let settingsRepositorySingleton: SettingsRepository | null = null;

export function getSettingsRepository(): SettingsRepository {
  if (!settingsRepositorySingleton) {
    settingsRepositorySingleton = createSettingsRepository();
  }

  return settingsRepositorySingleton;
}