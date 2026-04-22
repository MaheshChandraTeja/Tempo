import type {
    TreadmillMetrics,
    TreadmillParsedField,
    TreadmillParserWarning,
} from '@/vision/treadmill/treadmill.fields';

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

export function scoreParsedField<T>(
  field: TreadmillParsedField<T>,
): number {
  let score = field.value == null ? 0 : field.confidence;

  if (field.rawMatch) {
    score += 0.15;
  }

  if (field.sourceLine) {
    score += 0.1;
  }

  score -= Math.min(field.warnings.length * 0.12, 0.36);

  return clamp01(score);
}

export function scoreTreadmillMetrics(metrics: TreadmillMetrics): number {
  const scores = [
    scoreParsedField(metrics.time),
    scoreParsedField(metrics.distanceKm),
    scoreParsedField(metrics.caloriesKcal),
    scoreParsedField(metrics.speedKph),
    scoreParsedField(metrics.inclinePercent),
  ];

  const populatedScores = scores.filter(score => score > 0);

  if (populatedScores.length === 0) {
    return 0;
  }

  const sum = populatedScores.reduce((acc, value) => acc + value, 0);
  return clamp01(sum / populatedScores.length);
}

export function applyWarningPenalty(
  baseScore: number,
  warnings: readonly TreadmillParserWarning[],
): number {
  const penalty = Math.min(warnings.length * 0.05, 0.25);
  return clamp01(baseScore - penalty);
}