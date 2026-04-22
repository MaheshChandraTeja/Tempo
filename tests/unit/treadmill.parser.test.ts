import { treadmillOcrSamples } from '@/tests/fixtures/treadmill-ocr-samples';
import { parseTreadmillOcr } from '@/vision/treadmill/treadmill.parser';

describe('parseTreadmillOcr', () => {
  it('parses a clean treadmill OCR sample into structured metrics', () => {
    const result = parseTreadmillOcr(treadmillOcrSamples.cleanBasic);

    expect(result.metrics.time.value?.totalSeconds).toBe(750);
    expect(result.metrics.time.value?.display).toBe('12:30');
    expect(result.metrics.distanceKm.value).toBe(1.5);
    expect(result.metrics.caloriesKcal.value).toBe(145);
    expect(result.metrics.speedKph.value).toBe(7.2);
    expect(result.metrics.inclinePercent.value).toBe(2);
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('handles common LED OCR mistakes like 1/O and . vs :', () => {
    const result = parseTreadmillOcr(treadmillOcrSamples.noisyLedCommonMistakes);

    expect(result.metrics.time.value?.totalSeconds).toBe(750);
    expect(result.metrics.distanceKm.value).toBe(1.5);
    expect(result.metrics.speedKph.value).toBe(7.2);
    expect(result.metrics.inclinePercent.value).toBe(2);
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('warns when a field is missing', () => {
    const result = parseTreadmillOcr(treadmillOcrSamples.partialMissingIncline);

    expect(result.metrics.inclinePercent.value).toBeNull();

    const inclineWarnings = result.warnings.filter(
      warning => warning.field === 'incline',
    );

    expect(inclineWarnings.length).toBeGreaterThan(0);
  });

  it('flags inconsistent values when speed does not align with time and distance', () => {
    const result = parseTreadmillOcr(treadmillOcrSamples.inconsistentSpeed);

    expect(
      result.warnings.some(
        warning =>
          warning.code === 'INCONSISTENT_VALUES' &&
          warning.field === 'speed',
      ),
    ).toBe(true);
  });

  it('propagates OCR-level warnings into the parser result', () => {
    const result = parseTreadmillOcr(treadmillOcrSamples.withOcrWarnings);

    expect(
      result.warnings.some(warning => warning.code === 'OCR_ARTIFACT'),
    ).toBe(true);
  });
});