import { useCallback, useMemo, useState } from 'react';

import type {
    TreadmillScanResult,
    TreadmillScanStatus,
} from '@/types/common';
import { DEBUG_TAGS } from '@/utils/logger/debugTags';
import { localLogger } from '@/utils/logger/localLogger';
import { normalizeOcrText } from '@/utils/strings/normalizeOcrText';

type ScanParser = (normalizedText: string) => TreadmillScanResult['metrics'];

type UseTreadmillScanOptions = Readonly<{
  parser?: ScanParser;
}>;

type UseTreadmillScanResult = Readonly<{
  status: TreadmillScanStatus;
  result: TreadmillScanResult | null;
  error: string | null;
  beginPreparation: () => void;
  reset: () => void;
  runScan: (rawText: string) => Promise<TreadmillScanResult | null>;
}>;

function createScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultParser(): TreadmillScanResult['metrics'] {
  return [];
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Failed to process treadmill scan.';
}

export function useTreadmillScan(
  options: UseTreadmillScanOptions = {},
): UseTreadmillScanResult {
  const { parser = defaultParser } = options;

  const [status, setStatus] = useState<TreadmillScanStatus>('idle');
  const [result, setResult] = useState<TreadmillScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beginPreparation = useCallback(() => {
    setStatus('preparing');
    setError(null);
    localLogger.debug(DEBUG_TAGS.SCAN, 'Preparing treadmill scan session.');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    localLogger.debug(DEBUG_TAGS.SCAN, 'Treadmill scan state reset.');
  }, []);

  const runScan = useCallback(
    async (rawText: string): Promise<TreadmillScanResult | null> => {
      setStatus('scanning');
      setError(null);

      try {
        const normalizedText = normalizeOcrText(rawText, {
          uppercase: true,
          preserveLineBreaks: true,
        });

        const metrics = parser(normalizedText);

        const nextResult: TreadmillScanResult = {
          id: createScanId(),
          rawText,
          normalizedText,
          metrics,
          capturedAt: new Date().toISOString(),
        };

        setResult(nextResult);
        setStatus('success');

        localLogger.info(DEBUG_TAGS.SCAN, 'Treadmill scan processed.', {
          scanId: nextResult.id,
          metricsCount: nextResult.metrics.length,
        });

        return nextResult;
      } catch (scanError) {
        const message = getErrorMessage(scanError);

        setStatus('error');
        setError(message);

        localLogger.error(DEBUG_TAGS.SCAN, 'Treadmill scan failed.', {
          error: message,
        });

        return null;
      }
    },
    [parser],
  );

  return useMemo(
    () => ({
      status,
      result,
      error,
      beginPreparation,
      reset,
      runScan,
    }),
    [beginPreparation, error, reset, result, runScan, status],
  );
}