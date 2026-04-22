import { normalizeOcrText } from '@/utils/strings/normalizeOcrText';
import { safeTrim } from '@/utils/strings/safeTrim';
import type {
    OcrBlock,
    OcrLine,
    OcrNormalizedResult,
    OcrRawResult,
    OcrRunOptions,
    OcrWord,
} from '@/vision/ocr/ocr.types';

function tokenize(text: string): string[] {
  if (text.trim().length === 0) {
    return [];
  }

  return text
    .split(/[\s:|,;]+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function joinWords(words: readonly OcrWord[]): string {
  return words
    .map(word => safeTrim(word.text))
    .filter(Boolean)
    .join(' ');
}

function normalizeLineText(line: OcrLine): string {
  if (line.text.trim().length > 0) {
    return line.text;
  }

  return joinWords(line.words);
}

function flattenLines(blocks: readonly OcrBlock[]): string[] {
  const lines: string[] = [];

  for (const block of blocks) {
    for (const line of block.lines) {
      const text = safeTrim(normalizeLineText(line));
      if (text.length > 0) {
        lines.push(text);
      }
    }
  }

  return lines;
}

function dedupeAdjacentLines(lines: readonly string[]): string[] {
  const next: string[] = [];

  for (const line of lines) {
    if (next.length === 0 || next[next.length - 1] !== line) {
      next.push(line);
    }
  }

  return next;
}

function buildWarnings(raw: OcrRawResult, normalizedText: string, lines: readonly string[]): string[] {
  const warnings: string[] = [];

  if (raw.text.trim().length === 0 && raw.blocks.length === 0) {
    warnings.push('OCR returned no text blocks.');
  }

  if (normalizedText.trim().length === 0) {
    warnings.push('Normalized OCR text is empty.');
  }

  if (lines.length === 0) {
    warnings.push('No OCR lines could be extracted.');
  }

  return warnings;
}

export function normalizeOcrRawResult(
  raw: OcrRawResult,
  options: OcrRunOptions = {},
): OcrNormalizedResult {
  const flattenedLines = dedupeAdjacentLines(flattenLines(raw.blocks));
  const rawLineText = flattenedLines.join('\n');
  const fallbackText = raw.text.trim().length > 0 ? raw.text : rawLineText;

  const normalizedText = normalizeOcrText(fallbackText, {
    uppercase: options.uppercase ?? true,
    preserveLineBreaks: options.preserveLineBreaks ?? true,
  });

  const lines = normalizedText
    .split('\n')
    .map(line => safeTrim(line))
    .filter(Boolean);

  const tokens = tokenize(normalizedText);
  const warnings = buildWarnings(raw, normalizedText, lines);

  return {
    engine: raw.engine,
    rawText: fallbackText,
    normalizedText,
    lines,
    tokens,
    durationMs: raw.durationMs,
    warnings,
    metadata: raw.metadata,
  };
}