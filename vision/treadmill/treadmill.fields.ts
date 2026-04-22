export type TreadmillFieldKey =
  | 'time'
  | 'distance'
  | 'calories'
  | 'speed'
  | 'incline';

export type TreadmillParsedField<TValue> = Readonly<{
  key: TreadmillFieldKey;
  label: string;
  value: TValue | null;
  rawMatch: string | null;
  sourceLine: string | null;
  confidence: number;
  warnings: string[];
}>;

export type TreadmillDurationValue = Readonly<{
  totalSeconds: number;
  display: string;
}>;

export type TreadmillMetrics = Readonly<{
  time: TreadmillParsedField<TreadmillDurationValue>;
  distanceKm: TreadmillParsedField<number>;
  caloriesKcal: TreadmillParsedField<number>;
  speedKph: TreadmillParsedField<number>;
  inclinePercent: TreadmillParsedField<number>;
}>;

export type TreadmillParserWarning = Readonly<{
  code:
    | 'MISSING_FIELD'
    | 'AMBIGUOUS_MATCH'
    | 'OCR_ARTIFACT'
    | 'OUT_OF_RANGE'
    | 'INCONSISTENT_VALUES';
  message: string;
  field?: TreadmillFieldKey;
}>;

export type TreadmillParserResult = Readonly<{
  normalizedText: string;
  lines: string[];
  metrics: TreadmillMetrics;
  confidence: number;
  warnings: TreadmillParserWarning[];
}>;

export const TREADMILL_FIELD_LABELS: Readonly<Record<TreadmillFieldKey, string>> =
  Object.freeze({
    time: 'Time',
    distance: 'Distance',
    calories: 'Calories',
    speed: 'Speed',
    incline: 'Incline',
  });

export function createEmptyParsedField<TValue>(
  key: TreadmillFieldKey,
): TreadmillParsedField<TValue> {
  return {
    key,
    label: TREADMILL_FIELD_LABELS[key],
    value: null,
    rawMatch: null,
    sourceLine: null,
    confidence: 0,
    warnings: [],
  };
}