import { calculateWorkoutStreaks } from '@/modules/analytics/streaks';
import {
    aggregateWorkouts,
    aggregateWorkoutsByDate,
    filterWorkoutsByDateRange,
} from '@/modules/analytics/workoutAggregation';
import { workoutSamples } from '@/tests/fixtures/workout-samples';

describe('workout aggregation', () => {
  it('aggregates totals correctly across workouts', () => {
    const entries = [
      workoutSamples.treadmillA,
      workoutSamples.treadmillB,
      workoutSamples.walkA,
    ];

    const result = aggregateWorkouts(entries);

    expect(result.totalWorkouts).toBe(3);
    expect(result.totalCaloriesKcal).toBe(640);
    expect(result.totalDurationSeconds).toBe(6900);
    expect(result.totalDistanceKm).toBe(10.4);
  });

  it('aggregates workouts by date', () => {
    const entries = [...workoutSamples.sameDayPair, workoutSamples.runA];
    const result = aggregateWorkoutsByDate(entries);

    expect(result.length).toBe(2);
    expect(result[0]?.date).toBe('2026-01-15');
    expect(result[0]?.totalWorkouts).toBe(2);
    expect(result[0]?.totalCaloriesKcal).toBe(290);
  });

  it('filters workouts within a date range', () => {
    const entries = [
      workoutSamples.treadmillA,
      workoutSamples.treadmillB,
      workoutSamples.walkA,
      workoutSamples.runA,
    ];

    const result = filterWorkoutsByDateRange(entries, {
      startDate: workoutSamples.walkA.date,
      endDate: workoutSamples.treadmillA.date,
    });

    expect(result.length).toBe(3);
  });

  it('calculates current and longest streaks deterministically', () => {
    const entries = [
      {
        ...workoutSamples.treadmillA,
        date: '2026-01-10',
      },
      {
        ...workoutSamples.treadmillB,
        date: '2026-01-09',
      },
      {
        ...workoutSamples.walkA,
        date: '2026-01-08',
      },
      {
        ...workoutSamples.runA,
        date: '2026-01-06',
      },
    ];

    const streaks = calculateWorkoutStreaks(
      entries,
      new Date('2026-01-10T12:00:00.000Z'),
    );

    expect(streaks.currentStreakDays).toBe(3);
    expect(streaks.longestStreakDays).toBe(3);
  });
});