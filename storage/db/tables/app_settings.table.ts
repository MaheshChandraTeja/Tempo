export const APP_SETTINGS_TABLE = 'app_settings';

export const appSettingsColumns = Object.freeze({
  key: 'setting_key',
  value: 'setting_value',
  updatedAt: 'updated_at',
});

export const CREATE_APP_SETTINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${APP_SETTINGS_TABLE} (
  ${appSettingsColumns.key} TEXT PRIMARY KEY NOT NULL,
  ${appSettingsColumns.value} TEXT,
  ${appSettingsColumns.updatedAt} TEXT NOT NULL
);
`;

export const CREATE_APP_SETTINGS_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON ${APP_SETTINGS_TABLE} (${appSettingsColumns.updatedAt});`,
] as const;