import { createMockOcrAdapter } from '@/vision/ocr/ocr.adapter';
import { createScanPipeline } from '@/vision/pipeline/scan.pipeline';

describe('scan pipeline integration', () => {
  it('runs OCR + treadmill parsing end to end for a clean sample', async () => {
    const pipeline = createScanPipeline({
      ocrAdapter: createMockOcrAdapter(`
TIME 12:30
DIST 1.50
CAL 145
SPEED 7.20
INCL 2.0
      `),
      now: (() => {
        let current = 0;
        return () => {
          current += 5;
          return current;
        };
      })(),
    });

    const result = await pipeline.run({
      source: {
        kind: 'image-uri',
        uri: 'file:///tmp/test-treadmill.jpg',
        width: 1920,
        height: 1080,
      },
      captureDebugLabel: 'integration-test',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected successful pipeline result.');
    }

    expect(result.parsed.metrics.time.value?.display).toBe('12:30');
    expect(result.parsed.metrics.distanceKm.value).toBe(1.5);
    expect(result.parsed.metrics.caloriesKcal.value).toBe(145);
    expect(result.parsed.metrics.speedKph.value).toBe(7.2);
    expect(result.parsed.metrics.inclinePercent.value).toBe(2);
    expect(result.metrics.stages.some(stage => stage.stage === 'ocr')).toBe(true);
    expect(result.metrics.stages.some(stage => stage.stage === 'parse')).toBe(true);
  });

  it('returns an error result when OCR input is invalid', async () => {
    const pipeline = createScanPipeline({
      ocrAdapter: createMockOcrAdapter('TIME 10:00'),
    });

    const result = await pipeline.run({
      source: {
        kind: 'image-uri',
        uri: '',
      },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected failed pipeline result.');
    }

    expect(result.error).toContain('Image URI is required');
  });
});