export const APP_NAME = 'Tempo';
export const APP_DISPLAY_NAME = 'Tempo';

export const APP_VERSION = '1.0.0';
export const BUILD_CHANNEL = 'local';

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'tempo.userPreferences',
  EXERCISE_DRAFT: 'tempo.exerciseDraft',
  DAILY_LOGS: 'tempo.dailyLogs',
  SCAN_CACHE: 'tempo.scanCache',
} as const;

export const UI = {
  SCREEN_HORIZONTAL_PADDING: 20,
  CONTENT_MAX_WIDTH: 720,
  BORDER_RADIUS: 16,
} as const;

export const TIMING = {
  SPLASH_MIN_DURATION_MS: 250,
  TOAST_DURATION_MS: 2500,
} as const;