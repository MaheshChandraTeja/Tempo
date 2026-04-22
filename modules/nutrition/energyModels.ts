export type MetActivityProfile = Readonly<{
  low: number;
  moderate: number;
  high: number;
  default: number;
}>;

export type EnergyModelInput = Readonly<{
  met: number;
  weightKg: number;
  durationSeconds: number;
}>;

export const DEFAULT_WEIGHT_KG = 70;

export const WORKOUT_MET_MODELS = Object.freeze({
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
}) satisfies Record<string, MetActivityProfile>;

export function getKcalFromMet(input: EnergyModelInput): number {
  if (
    !Number.isFinite(input.met) ||
    !Number.isFinite(input.weightKg) ||
    !Number.isFinite(input.durationSeconds) ||
    input.met <= 0 ||
    input.weightKg <= 0 ||
    input.durationSeconds <= 0
  ) {
    return 0;
  }

  const durationHours = input.durationSeconds / 3600;
  return Math.round(input.met * input.weightKg * durationHours);
}