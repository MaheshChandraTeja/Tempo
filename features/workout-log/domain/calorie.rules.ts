import type {
    CalorieEstimateInput,
    CalorieEstimateResult,
    WorkoutIntensity,
    WorkoutKind,
} from '@/features/workout-log/domain/workout.types';

const DEFAULT_WEIGHT_KG = 70;

const MET_VALUES: Readonly<Record<WorkoutKind, Record<WorkoutIntensity | 'default', number>>> =
  Object.freeze({
    treadmill: {
      low: 4.3,
      moderate: 7.0,
      high: 10.0,
      default: 6.0,
    },
    'outdoor-walk': {
      low: 3.5,
      moderate: 4.3,
      high: 5.0,
      default: 4.0,
    },
    'outdoor-run': {
      low: 7.0,
      moderate: 9.8,
      high: 11.5,
      default: 9.0,
    },
    cycling: {
      low: 4.0,
      moderate: 6.8,
      high: 10.0,
      default: 6.0,
    },
    elliptical: {
      low: 5.0,
      moderate: 6.5,
      high: 8.0,
      default: 6.0,
    },
    rowing: {
      low: 5.0,
      moderate: 7.0,
      high: 8.5,
      default: 6.5,
    },
    strength: {
      low: 3.5,
      moderate: 5.0,
      high: 6.0,
      default: 4.5,
    },
    functional: {
      low: 4.5,
      moderate: 6.5,
      high: 8.0,
      default: 6.0,
    },
    hiit: {
      low: 6.0,
      moderate: 8.0,
      high: 10.5,
      default: 8.5,
    },
    other: {
      low: 3.0,
      moderate: 5.0,
      high: 7.0,
      default: 4.5,
    },
  });

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function safeDurationHours(durationSeconds: number | null): number {
  if (durationSeconds == null || durationSeconds <= 0) {
    return 0;
  }

  return durationSeconds / 3600;
}

function resolveWeightKg(weightKg?: number | null): number {
  if (weightKg == null || !Number.isFinite(weightKg) || weightKg <= 0) {
    return DEFAULT_WEIGHT_KG;
  }

  return weightKg;
}

function getMetValue(
  kind: WorkoutKind,
  intensity?: WorkoutIntensity | null,
): number {
  const table = MET_VALUES[kind];
  if (!table) {
    return 4.5;
  }

  if (intensity && table[intensity] != null) {
    return table[intensity];
  }

  return table.default;
}

function estimateDistanceBased(input: CalorieEstimateInput): CalorieEstimateResult | null {
  const { kind, distanceKm, inclinePercent = 0, durationSeconds } = input;

  if (
    distanceKm == null ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0 ||
    durationSeconds == null ||
    durationSeconds <= 0
  ) {
    return null;
  }

  let caloriesPerKm: number | null = null;

  switch (kind) {
    case 'outdoor-walk':
    case 'treadmill':
      caloriesPerKm = 50;
      break;
    case 'outdoor-run':
      caloriesPerKm = 70;
      break;
    default:
      caloriesPerKm = null;
  }

  if (caloriesPerKm == null) {
    return null;
  }

  const inclineMultiplier = 1 + Math.min(Math.max(inclinePercent, 0), 20) * 0.03;
  const caloriesKcal = round(distanceKm * caloriesPerKm * inclineMultiplier, 0);

  return {
    caloriesKcal,
    method: 'distance-based',
    confidence: durationSeconds >= 15 * 60 ? 'high' : 'medium',
  };
}

function estimateMetBased(input: CalorieEstimateInput): CalorieEstimateResult | null {
  const durationHours = safeDurationHours(input.durationSeconds);

  if (durationHours <= 0) {
    return null;
  }

  const weightKg = resolveWeightKg(input.weightKg);
  const met = getMetValue(input.kind, input.intensity);

  const caloriesKcal = round(met * weightKg * durationHours, 0);

  return {
    caloriesKcal,
    method: 'met-based',
    confidence:
      input.intensity != null || input.weightKg != null ? 'medium' : 'low',
  };
}

function estimateFallback(input: CalorieEstimateInput): CalorieEstimateResult {
  const durationHours = Math.max(safeDurationHours(input.durationSeconds), 0);
  const caloriesKcal = round(280 * durationHours, 0);

  return {
    caloriesKcal,
    method: 'fallback',
    confidence: 'low',
  };
}

export function estimateWorkoutCalories(
  input: CalorieEstimateInput,
): CalorieEstimateResult {
  const distanceBased = estimateDistanceBased(input);
  if (distanceBased) {
    return distanceBased;
  }

  const metBased = estimateMetBased(input);
  if (metBased) {
    return metBased;
  }

  return estimateFallback(input);
}

export function shouldEstimateCalories(caloriesKcal: number | null | undefined): boolean {
  return caloriesKcal == null || !Number.isFinite(caloriesKcal) || caloriesKcal < 0;
}