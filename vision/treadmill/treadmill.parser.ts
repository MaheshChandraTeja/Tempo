import type { OcrNormalizedResult } from '@/vision/ocr/ocr.types';
import {
    applyWarningPenalty,
    scoreTreadmillMetrics,
} from '@/vision/treadmill/treadmill.confidence';
import {
    createEmptyParsedField,
    type TreadmillMetrics,
    type TreadmillParsedField,
    type TreadmillParserResult,
    type TreadmillParserWarning,
} from '@/vision/treadmill/treadmill.fields';
import {
    looksLikeNumericToken,
    looksLikeTimeToken,
    treadmillPatterns,
} from '@/vision/treadmill/treadmill.patterns';
import {
    collectFieldWarnings,
    finalizeTreadmillMetrics,
    parseDurationText,
    parseNumericText,
} from '@/vision/treadmill/treadmill.postprocess';
import { validateTreadmillMetrics } from '@/vision/treadmill/treadmill.validators';

type FieldName = keyof typeof treadmillPatterns;

function tokenizeLine(line: string): string[] {
  return line
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function findBestFieldLine(
  lines: readonly string[],
  fieldName: FieldName,
): { line: string; lineIndex: number; aliasMatched: boolean } | null {
  const aliases = treadmillPatterns[fieldName].aliases;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (aliases.some(alias => alias.test(line))) {
      return {
        line,
        lineIndex: index,
        aliasMatched: true,
      };
    }
  }

  return null;
}

function extractTimeField(
  lines: readonly string[],
): TreadmillParsedField<{ totalSeconds: number; display: string }> {
  const field = createEmptyParsedField<{ totalSeconds: number; display: string }>('time');
  const bestLine = findBestFieldLine(lines, 'time');

  if (!bestLine) {
    return {
      ...field,
      warnings: ['Field missing from OCR text.'],
    };
  }

  const directMatch = bestLine.line.match(treadmillPatterns.time.value);
  const tokenMatch = tokenizeLine(bestLine.line).find(looksLikeTimeToken) ?? null;
  const rawMatch = directMatch?.[1] ?? tokenMatch;

  if (!rawMatch) {
    return {
      ...field,
      sourceLine: bestLine.line,
      warnings: ['Time label found but value could not be extracted.'],
      confidence: 0.25,
    };
  }

  const parsed = parseDurationText(rawMatch);

  return {
    ...field,
    value: parsed,
    rawMatch,
    sourceLine: bestLine.line,
    confidence: parsed ? 0.8 : 0.25,
    warnings: parsed ? [] : ['Time value could not be parsed.'],
  };
}

function extractNumericField(
  fieldKey: 'distance' | 'calories' | 'speed' | 'incline',
  metricKey: 'distanceKm' | 'caloriesKcal' | 'speedKph' | 'inclinePercent',
  lines: readonly string[],
): TreadmillParsedField<number> {
  const field = createEmptyParsedField<number>(fieldKey);
  const bestLine = findBestFieldLine(lines, fieldKey);

  if (!bestLine) {
    return {
      ...field,
      warnings: ['Field missing from OCR text.'],
    };
  }

  const directMatch = bestLine.line.match(treadmillPatterns[fieldKey].value);
  const tokenMatch = tokenizeLine(bestLine.line).find(looksLikeNumericToken) ?? null;
  const rawMatch = directMatch?.[1] ?? tokenMatch;

  if (!rawMatch) {
    return {
      ...field,
      sourceLine: bestLine.line,
      warnings: [`${field.label} label found but numeric value could not be extracted.`],
      confidence: 0.25,
    };
  }

  const parsed = parseNumericText(rawMatch);

  return {
    ...field,
    key: fieldKey,
    label: field.label,
    value: parsed,
    rawMatch,
    sourceLine: bestLine.line,
    confidence: parsed != null ? 0.78 : 0.25,
    warnings: parsed != null ? [] : [`${field.label} value could not be parsed.`],
  };
}

function buildMetrics(lines: readonly string[]): TreadmillMetrics {
  return {
    time: extractTimeField(lines),
    distanceKm: extractNumericField('distance', 'distanceKm', lines),
    caloriesKcal: extractNumericField('calories', 'caloriesKcal', lines),
    speedKph: extractNumericField('speed', 'speedKph', lines),
    inclinePercent: extractNumericField('incline', 'inclinePercent', lines),
  };
}

export function parseTreadmillOcr(
  normalized: OcrNormalizedResult,
): TreadmillParserResult {
  const baseMetrics = buildMetrics(normalized.lines);
  const finalizedMetrics = finalizeTreadmillMetrics(baseMetrics);

  const fieldWarnings = collectFieldWarnings(finalizedMetrics);
  const validatorWarnings = validateTreadmillMetrics(finalizedMetrics);

  const warnings: TreadmillParserWarning[] = [
    ...fieldWarnings,
    ...validatorWarnings,
    ...normalized.warnings.map(message => ({
      code: 'OCR_ARTIFACT' as const,
      message,
    })),
  ];

  const baseConfidence = scoreTreadmillMetrics(finalizedMetrics);
  const confidence = applyWarningPenalty(baseConfidence, warnings);

  return {
    normalizedText: normalized.normalizedText,
    lines: normalized.lines,
    metrics: finalizedMetrics,
    confidence,
    warnings,
  };
}