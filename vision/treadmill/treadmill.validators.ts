import type {
    TreadmillDurationValue,
    TreadmillFieldKey,
    TreadmillMetrics,
    TreadmillParserWarning,
} from '@/vision/treadmill/treadmill.fields';

export function isDurationValueValid(value: TreadmillDurationValue | null): boolean {
  if (!value) {
    return false;
  }

  return value.totalSeconds > 0 && value.totalSeconds <= 24 * 60 * 60;
}

export function isDistanceValueValid(value: number | null): boolean {
  return value != null && value >= 0 && value <= 100;
}

export function isCaloriesValueValid(value: number | null): boolean {
  return value != null && value >= 0 && value <= 5000;
}

export function isSpeedValueValid(value: number | null): boolean {
  return value != null && value >= 0 && value <= 40;
}

export function isInclineValueValid(value: number | null): boolean {
  return value != null && value >= 0 && value <= 30;
}

export function isFieldValueValid(
  field: TreadmillFieldKey,
  value: unknown,
): boolean {
  switch (field) {
    case 'time':
      return isDurationValueValid(value as TreadmillDurationValue | null);
    case 'distance':
      return isDistanceValueValid(value as number | null);
    case 'calories':
      return isCaloriesValueValid(value as number | null);
    case 'speed':
      return isSpeedValueValid(value as number | null);
    case 'incline':
      return isInclineValueValid(value as number | null);
    default: {
      const exhaustiveCheck: never = field;
      return exhaustiveCheck;
    }
  }
}

export function validateTreadmillMetrics(
  metrics: TreadmillMetrics,
): TreadmillParserWarning[] {
  const warnings: TreadmillParserWarning[] = [];

  const timeSeconds = metrics.time.value?.totalSeconds ?? null;
  const distance = metrics.distanceKm.value;
  const speed = metrics.speedKph.value;
  const incline = metrics.inclinePercent.value;

  if (timeSeconds != null && distance != null && speed != null && timeSeconds > 0) {
    const derivedSpeed = distance / (timeSeconds / 3600);
    const speedDifference = Math.abs(derivedSpeed - speed);

    if (speedDifference > 4) {
      warnings.push({
        code: 'INCONSISTENT_VALUES',
        field: 'speed',
        message: 'Reported speed does not align well with time and distance.',
      });
    }
  }

  if (incline != null && incline > 20) {
    warnings.push({
      code: 'OUT_OF_RANGE',
      field: 'incline',
      message: 'Incline appears unusually high for a treadmill display.',
    });
  }

  return warnings;
}