import type {
    OcrNormalizedResult,
    OcrRawResult,
    OcrResult,
} from '@/vision/ocr/ocr.types';

export type OcrDebugSummary = Readonly<{
  ok: boolean;
  engine: string;
  durationMs: number | null;
  rawTextPreview: string;
  normalizedTextPreview: string;
  lineCount: number;
  tokenCount: number;
  warningCount: number;
  errorMessage: string | null;
}>;

function preview(text: string, maxLength = 160): string {
  const compact = text.replace(/\s+/g, ' ').trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 1)}…`;
}

export function summarizeOcrRawResult(raw: OcrRawResult): string {
  return [
    `engine=${raw.engine}`,
    `durationMs=${raw.durationMs}`,
    `blocks=${raw.blocks.length}`,
    `textLength=${raw.text.length}`,
  ].join(' | ');
}

export function summarizeOcrNormalizedResult(
  normalized: OcrNormalizedResult,
): string {
  return [
    `engine=${normalized.engine}`,
    `durationMs=${normalized.durationMs}`,
    `lines=${normalized.lines.length}`,
    `tokens=${normalized.tokens.length}`,
    `warnings=${normalized.warnings.length}`,
    `preview="${preview(normalized.normalizedText)}"`,
  ].join(' | ');
}

export function buildOcrDebugSummary(result: OcrResult): OcrDebugSummary {
  if (!result.ok) {
    return {
      ok: false,
      engine: 'unknown',
      durationMs: null,
      rawTextPreview: '',
      normalizedTextPreview: '',
      lineCount: 0,
      tokenCount: 0,
      warningCount: 0,
      errorMessage: result.error.message,
    };
  }

  return {
    ok: true,
    engine: result.normalized.engine,
    durationMs: result.normalized.durationMs,
    rawTextPreview: preview(result.normalized.rawText),
    normalizedTextPreview: preview(result.normalized.normalizedText),
    lineCount: result.normalized.lines.length,
    tokenCount: result.normalized.tokens.length,
    warningCount: result.normalized.warnings.length,
    errorMessage: null,
  };
}

export function buildOcrFailureReport(result: OcrResult): string {
  if (result.ok) {
    return 'OCR succeeded. No failure report.';
  }

  return [
    `code=${result.error.code}`,
    `message=${result.error.message}`,
  ].join(' | ');
}

export function dumpNormalizedLines(
  normalized: OcrNormalizedResult,
): string {
  if (normalized.lines.length === 0) {
    return '[no lines]';
  }

  return normalized.lines
    .map((line, index) => `${index + 1}. ${line}`)
    .join('\n');
}