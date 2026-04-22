export const SCAN_DEFAULTS = Object.freeze({
  minAcceptedConfidence: 0.5,
  goodConfidence: 0.8,
  warningConfidence: 0.6,
  debugEnabledByDefault: __DEV__,
  captureDebugLabel: 'scan-session',
});

export const SCAN_LABELS = Object.freeze({
  titleIntro: 'Treadmill Scan',
  titleCapture: 'Scan Treadmill Display',
  titleReview: 'Review Scan',
  titleDebug: 'Scan Debug',
});

export const SCAN_FIELD_ORDER = Object.freeze([
  'time',
  'distanceKm',
  'caloriesKcal',
  'speedKph',
  'inclinePercent',
] as const);