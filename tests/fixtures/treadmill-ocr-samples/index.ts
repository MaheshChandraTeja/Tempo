import type { OcrNormalizedResult } from '@/vision/ocr/ocr.types';

function buildNormalizedSample(
  text: string,
  warnings: string[] = [],
): OcrNormalizedResult {
  const normalizedText = text.trim();

  return {
    engine: 'mock',
    rawText: normalizedText,
    normalizedText,
    lines: normalizedText.split('\n').map(line => line.trim()).filter(Boolean),
    tokens: normalizedText
      .split(/[\s:|,;]+/)
      .map(token => token.trim())
      .filter(Boolean),
    durationMs: 12,
    warnings,
    metadata: {
      fixture: true,
    },
  };
}

export const treadmillOcrSamples = Object.freeze({
  cleanBasic: buildNormalizedSample(`
TIME 12:30
DIST 1.50
CAL 145
SPEED 7.20
INCL 2.0
  `),

  noisyLedCommonMistakes: buildNormalizedSample(`
T1ME 12.30
DlST 1.5O
CAL 145
SPEED 7.2O
INCL 2.O
  `),

  partialMissingIncline: buildNormalizedSample(`
TIME 25:10
DIST 3.25
CAL 230
SPEED 7.80
  `),

  inconsistentSpeed: buildNormalizedSample(`
TIME 10:00
DIST 0.50
CAL 100
SPEED 12.00
INCL 1.0
  `),

  withOcrWarnings: buildNormalizedSample(
    `
TIME 08:45
DIST 1.10
CAL 95
SPD 7.5
INC 1.5
    `,
    ['OCR line confidence was low for one region.'],
  ),
});