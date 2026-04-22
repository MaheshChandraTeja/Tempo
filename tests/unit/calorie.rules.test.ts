import {
    estimateWorkoutCalories,
    shouldEstimateCalories,
} from '@/features/workout-log/domain/calorie.rules';

describe('calorie rules', () => {
  it('uses distance-based treadmill estimation when distance and duration are present', () => {
    const result = estimateWorkoutCalories({
      kind: 'treadmill',
      durationSeconds: 1800,
      distanceKm: 3,
      inclinePercent: 2,
      intensity: 'moderate',
      weightKg: 70,
    });

    expect(result.method).toBe('distance-based');
    expect(result.caloriesKcal).toBeGreaterThan(0);
  });

  it('falls back to MET-based estimation for strength workouts', () => {
    const result = estimateWorkoutCalories({
      kind: 'strength',
      durationSeconds: 2400,
      intensity: 'moderate',
      weightKg: 75,
    });

    expect(result.method).toBe('met-based');
    expect(result.caloriesKcal).toBeGreaterThan(0);
  });

  it('falls back when insufficient information is present', () => {
    const result = estimateWorkoutCalories({
      kind: 'other',
      durationSeconds: null,
      intensity: null,
      weightKg: null,
    });

    expect(result.method).toBe('fallback');
    expect(result.caloriesKcal).toBe(0);
  });

  it('recognizes when calories should be estimated', () => {
    expect(shouldEstimateCalories(null)).toBe(true);
    expect(shouldEstimateCalories(undefined)).toBe(true);
    expect(shouldEstimateCalories(-1)).toBe(true);
    expect(shouldEstimateCalories(120)).toBe(false);
  });
});