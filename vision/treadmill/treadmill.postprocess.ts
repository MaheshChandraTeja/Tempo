import { roundToDecimals } from '@/utils/number/round';
import type {
    TreadmillDurationValue,
    TreadmillFieldKey,
    TreadmillMetrics,
    TreadmillParsedField,
    TreadmillParserWarning,
} from '@/vision/treadmill/treadmill.fields';
import { isFieldValueValid } from '@/vision/treadmill/treadmill.validators';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseDurationText(raw: string): TreadmillDurationValue | null {
  const normalized = raw.replace(/\./g, ':');
  const parts = normalized.split(':').map(part => Number(part));

  if (parts.some(Number.isNaN)) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    const totalSeconds = minutes * 60 + seconds;

    return {
      totalSeconds,
      display: `${pad2(minutes)}:${pad2(seconds)}`,
    };
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return {
      totalSeconds,
      display: `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`,
    };
  }

  return null;
}

export function parseNumericText(raw: string): number | null {
  const cleaned = raw
    .replace(/O/g, '0')
    .replace(/S/g, '5')
    .replace(/,/g, '.')
    .trim();

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function normalizeParsedMetric(
  field: TreadmillFieldKey,
  value: unknown,
): unknown {
  switch (field) {
    case 'distance':
      return roundToDecimals(value as number, 2);
    case 'calories':
      return roundToDecimals(value as number, 0);
    case 'speed':
      return roundToDecimals(value as number, 2);
    case 'incline':
      return roundToDecimals(value as number, 1);
    case 'time':
      return value;
    default: {
      const exhaustiveCheck: never = field;
      return exhaustiveCheck;
    }
  }
}

export function finalizeParsedField<T>(
  field: TreadmillFieldKey,
  parsedField: TreadmillParsedField<T>,
): TreadmillParsedField<T> {
  const normalizedValue = normalizeParsedMetric(field, parsedField.value) as T;

  return {
    ...parsedField,
    value: normalizedValue,
    warnings: [
      ...parsedField.warnings,
      ...(isFieldValueValid(field, normalizedValue) ? [] : ['Value failed validation.']),
    ],
  };
}

export function finalizeTreadmillMetrics(
  metrics: TreadmillMetrics,
): TreadmillMetrics {
  return {
    time: finalizeParsedField('time', metrics.time),
    distanceKm: finalizeParsedField('distance', metrics.distanceKm),
    caloriesKcal: finalizeParsedField('calories', metrics.caloriesKcal),
    speedKph: finalizeParsedField('speed', metrics.speedKph),
    inclinePercent: finalizeParsedField('incline', metrics.inclinePercent),
  };
}

export function collectFieldWarnings(
  metrics: TreadmillMetrics,
): TreadmillParserWarning[] {
  const warnings: TreadmillParserWarning[] = [];

  const fieldMap = [
    metrics.time,
    metrics.distanceKm,
    metrics.caloriesKcal,
    metrics.speedKph,
    metrics.inclinePercent,
  ];

  for (const field of fieldMap) {
    for (const warning of field.warnings) {
      warnings.push({
        code: warning.includes('validation')
          ? 'OUT_OF_RANGE'
          : warning.includes('missing')
          ? 'MISSING_FIELD'
          : 'OCR_ARTIFACT',
        field: field.key,
        message: warning,
      });
    }
  }

  return warnings;
}