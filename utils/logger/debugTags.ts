export const DEBUG_TAGS = Object.freeze({
  APP: 'APP',
  NAVIGATION: 'NAVIGATION',
  THEME: 'THEME',
  STORAGE: 'STORAGE',
  PERMISSIONS: 'PERMISSIONS',
  OCR: 'OCR',
  SCAN: 'SCAN',
  LOGGING: 'LOGGING',
  HISTORY: 'HISTORY',
  FORMS: 'FORMS',
  CHARTS: 'CHARTS',
  PERFORMANCE: 'PERFORMANCE',
} as const);

export type DebugTag = (typeof DEBUG_TAGS)[keyof typeof DEBUG_TAGS];