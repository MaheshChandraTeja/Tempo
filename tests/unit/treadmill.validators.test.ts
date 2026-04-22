import { createEmptyParsedField } from '@/vision/treadmill/treadmill.fields';
import {
    isCaloriesValueValid,
    isDistanceValueValid,
    isDurationValueValid,
    isInclineValueValid,
    isSpeedValueValid,
    validateTreadmillMetrics,
} from '@/vision/treadmill/treadmill.validators';

describe('treadmill validators', () => {
  it('validates duration values within bounds', () => {
    expect(
      isDurationValueValid({
        totalSeconds: 600,
        display: '10:00',
      }),
    ).toBe(true);

    expect(
      isDurationValueValid({
        totalSeconds: 24 * 60 * 60 + 1,
        display: '24:00:01',
      }),
    ).toBe(false);
  });

  it('validates numeric treadmill field ranges', () => {
    expect(isDistanceValueValid(5)).toBe(true);
    expect(isDistanceValueValid(101)).toBe(false);

    expect(isCaloriesValueValid(250)).toBe(true);
    expect(isCaloriesValueValid(6000)).toBe(false);

    expect(isSpeedValueValid(8.5)).toBe(true);
    expect(isSpeedValueValid(45)).toBe(false);

    expect(isInclineValueValid(4)).toBe(true);
    expect(isInclineValueValid(40)).toBe(false);
  });

  it('returns inconsistency warnings for unrealistic speed relative to time and distance', () => {
    const metrics = {
      time: {
        ...createEmptyParsedField('time'),
        value: {
          totalSeconds: 600,
          display: '10:00',
        },
      },
      distanceKm: {
        ...createEmptyParsedField('distance'),
        key: 'distance',
        value: 1,
      },
      caloriesKcal: {
        ...createEmptyParsedField('calories'),
        key: 'calories',
        value: 100,
      },
      speedKph: {
        ...createEmptyParsedField('speed'),
        key: 'speed',
        value: 12,
      },
      inclinePercent: {
        ...createEmptyParsedField('incline'),
        key: 'incline',
        value: 1,
      },
    };

    const warnings = validateTreadmillMetrics(metrics);

    expect(
      warnings.some(
        warning =>
          warning.code === 'INCONSISTENT_VALUES' &&
          warning.field === 'speed',
      ),
    ).toBe(true);
  });

  it('warns when incline appears abnormally high', () => {
    const metrics = {
      time: {
        ...createEmptyParsedField('time'),
        value: {
          totalSeconds: 900,
          display: '15:00',
        },
      },
      distanceKm: {
        ...createEmptyParsedField('distance'),
        key: 'distance',
        value: 1.2,
      },
      caloriesKcal: {
        ...createEmptyParsedField('calories'),
        key: 'calories',
        value: 140,
      },
      speedKph: {
        ...createEmptyParsedField('speed'),
        key: 'speed',
        value: 5,
      },
      inclinePercent: {
        ...createEmptyParsedField('incline'),
        key: 'incline',
        value: 24,
      },
    };

    const warnings = validateTreadmillMetrics(metrics);

    expect(
      warnings.some(
        warning =>
          warning.code === 'OUT_OF_RANGE' &&
          warning.field === 'incline',
      ),
    ).toBe(true);
  });
});