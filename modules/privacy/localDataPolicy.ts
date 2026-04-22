export type LocalDataCategory =
  | 'workouts'
  | 'daily_summaries'
  | 'scan_sessions'
  | 'scan_images'
  | 'debug_artifacts'
  | 'preferences'
  | 'runtime_flags';

export type LocalDataRiskLevel = 'low' | 'moderate' | 'high';

export type LocalDataPolicyRule = Readonly<{
  category: LocalDataCategory;
  title: string;
  description: string;
  storedLocallyOnly: boolean;
  exportable: boolean;
  clearable: boolean;
  sensitive: boolean;
  riskLevel: LocalDataRiskLevel;
}>;

export type LocalDataPolicySummary = Readonly<{
  title: string;
  statement: string;
  categories: LocalDataPolicyRule[];
}>;

const POLICY_RULES: readonly LocalDataPolicyRule[] = Object.freeze([
  {
    category: 'workouts',
    title: 'Workout Logs',
    description:
      'Exercise entries, calories, distance, duration, and notes remain stored locally on device.',
    storedLocallyOnly: true,
    exportable: true,
    clearable: true,
    sensitive: true,
    riskLevel: 'moderate',
  },
  {
    category: 'daily_summaries',
    title: 'Daily Summaries',
    description:
      'Derived day-level totals used by dashboard and history views remain local.',
    storedLocallyOnly: true,
    exportable: true,
    clearable: true,
    sensitive: false,
    riskLevel: 'low',
  },
  {
    category: 'scan_sessions',
    title: 'Scan Sessions',
    description:
      'OCR text, parse results, and scan review metadata remain stored locally unless exported by the user.',
    storedLocallyOnly: true,
    exportable: true,
    clearable: true,
    sensitive: true,
    riskLevel: 'high',
  },
  {
    category: 'scan_images',
    title: 'Captured Scan Images',
    description:
      'Cached treadmill-display images remain local and can be removed as part of data-clearing flows.',
    storedLocallyOnly: true,
    exportable: false,
    clearable: true,
    sensitive: true,
    riskLevel: 'high',
  },
  {
    category: 'debug_artifacts',
    title: 'Debug Artifacts',
    description:
      'Local debug payloads and diagnostic dumps are written only on-device for troubleshooting.',
    storedLocallyOnly: true,
    exportable: false,
    clearable: true,
    sensitive: true,
    riskLevel: 'high',
  },
  {
    category: 'preferences',
    title: 'Preferences',
    description:
      'Debug mode, goals, and other local preferences remain on-device.',
    storedLocallyOnly: true,
    exportable: false,
    clearable: true,
    sensitive: false,
    riskLevel: 'low',
  },
  {
    category: 'runtime_flags',
    title: 'Runtime Flags',
    description:
      'Internal local flags used for seeding or app-state bookkeeping remain on-device.',
    storedLocallyOnly: true,
    exportable: false,
    clearable: true,
    sensitive: false,
    riskLevel: 'low',
  },
]);

export function getLocalDataPolicyRules(): readonly LocalDataPolicyRule[] {
  return POLICY_RULES;
}

export function getLocalDataPolicySummary(): LocalDataPolicySummary {
  return {
    title: 'Tempo Local Data Policy',
    statement:
      'Tempo keeps workout, scan, and preference data on-device by default. Data is only exported through explicit user action.',
    categories: POLICY_RULES,
  };
}

export function getSensitiveLocalDataCategories(): LocalDataCategory[] {
  return POLICY_RULES.filter(rule => rule.sensitive).map(rule => rule.category);
}

export function getClearableLocalDataCategories(): LocalDataCategory[] {
  return POLICY_RULES.filter(rule => rule.clearable).map(rule => rule.category);
}

export function getExportableLocalDataCategories(): LocalDataCategory[] {
  return POLICY_RULES.filter(rule => rule.exportable).map(rule => rule.category);
}

export function describeLocalOnlyBehavior(): string {
  return [
    'Workout logs, scan metadata, and settings stay on-device by default.',
    'No automatic cloud sync is performed by the app.',
    'Exports happen only when the user explicitly triggers them.',
    'Local data can be cleared through an explicit destructive action flow.',
  ].join(' ');
}