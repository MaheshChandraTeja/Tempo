import type {
    WorkoutEntry,
    WorkoutIntensity,
    WorkoutKind,
} from '@/features/workout-log/domain/workout.types';
import {
    DEFAULT_WEIGHT_KG,
    getKcalFromMet,
    WORKOUT_MET_MODELS,
} from '@/modules/nutrition/energyModels';

export type CalorieEstimateBreakdown = Readonly<{
  estimatedCaloriesKcal: number;
  basis: 'recorded' | 'met' | 'distance' | 'fallback';
  weightKgUsed: number;
  metUsed: number | null;
}>;

function resolveWeightKg(entry: WorkoutEntry, fallbackWeightKg = DEFAULT_WEIGHT_KG): number {
  const value = entry.metrics.weightKg;

  if (value != null && Number.isFinite(value) && value > 0) {
    return value;
  }

  return fallbackWeightKg;
}

function getMetForWorkout(
  kind: WorkoutKind,
  intensity: WorkoutIntensity | null,
): number {
  const profile = WORKOUT_MET_MODELS[kind] ?? WORKOUT_MET_MODELS.other;

  if (intensity && profile[intensity] != null) {
    return profile[intensity];
  }

  return profile.default;
}

function estimateDistanceCalories(entry: WorkoutEntry): number | null {
  const distanceKm = entry.metrics.distanceKm;
  const durationSeconds = entry.metrics.durationSeconds;
  const incline = entry.metrics.inclinePercent ?? 0;

  if (
    distanceKm == null ||
    durationSeconds == null ||
    distanceKm <= 0 ||
    durationSeconds <= 0
  ) {
    return null;
  }

  let caloriesPerKm: number | null = null;

  if (entry.kind === 'treadmill' || entry.kind === 'outdoor-walk') {
    caloriesPerKm = 50;
  } else if (entry.kind === 'outdoor-run') {
    caloriesPerKm = 70;
  }

  if (caloriesPerKm == null) {
    return null;
  }

  const inclineMultiplier = 1 + Math.min(Math.max(incline, 0), 20) * 0.03;
  return Math.round(distanceKm * caloriesPerKm * inclineMultiplier);
}

export function estimateWorkoutCalories(
  entry: WorkoutEntry,
  fallbackWeightKg = DEFAULT_WEIGHT_KG,
): CalorieEstimateBreakdown {
  if (entry.metrics.caloriesKcal != null && entry.metrics.caloriesKcal >= 0) {
    return {
      estimatedCaloriesKcal: Math.round(entry.metrics.caloriesKcal),
      basis: 'recorded',
      weightKgUsed: resolveWeightKg(entry, fallbackWeightKg),
      metUsed: null,
    };
  }

  const distanceEstimate = estimateDistanceCalories(entry);

  if (distanceEstimate != null) {
    return {
      estimatedCaloriesKcal: distanceEstimate,
      basis: 'distance',
      weightKgUsed: resolveWeightKg(entry, fallbackWeightKg),
      metUsed: null,
    };
  }

  const met = getMetForWorkout(entry.kind, entry.intensity);
  const weightKg = resolveWeightKg(entry, fallbackWeightKg);
  const durationSeconds = entry.metrics.durationSeconds ?? 0;

  const metEstimate = getKcalFromMet({
    met,
    weightKg,
    durationSeconds,
  });

  if (metEstimate > 0) {
    return {
      estimatedCaloriesKcal: metEstimate,
      basis: 'met',
      weightKgUsed: weightKg,
      metUsed: met,
    };
  }

  const fallback = Math.round((durationSeconds / 3600) * 280);

  return {
    estimatedCaloriesKcal: Math.max(fallback, 0),
    basis: 'fallback',
    weightKgUsed: weightKg,
    metUsed: null,
  };
}