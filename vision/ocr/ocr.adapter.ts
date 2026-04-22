import { DEBUG_TAGS } from '@/utils/logger/debugTags';
import { localLogger } from '@/utils/logger/localLogger';
import { normalizeOcrRawResult } from '@/vision/ocr/ocr.normalize';
import type {
    OcrAdapter,
    OcrAdapterContext,
    OcrFailure,
    OcrImageSource,
    OcrResult,
    OcrRunOptions,
} from '@/vision/ocr/ocr.types';

function nowMs(context?: OcrAdapterContext): number {
  return context?.now?.() ?? Date.now();
}

function getLogger(context?: OcrAdapterContext) {
  return (
    context?.logger ?? {
      debug: (message: string, details?: unknown) =>
        localLogger.debug(DEBUG_TAGS.OCR, message, details),
      error: (message: string, details?: unknown) =>
        localLogger.error(DEBUG_TAGS.OCR, message, details),
    }
  );
}

function validateInput(input: OcrImageSource): OcrFailure | null {
  switch (input.kind) {
    case 'photo-file':
      if (!input.path || input.path.trim().length === 0) {
        return {
          code: 'INVALID_INPUT',
          message: 'Photo file path is required.',
        };
      }
      return null;

    case 'image-uri':
      if (!input.uri || input.uri.trim().length === 0) {
        return {
          code: 'INVALID_INPUT',
          message: 'Image URI is required.',
        };
      }
      return null;

    case 'frame':
      if (!input.frameId || input.frameId.trim().length === 0) {
        return {
          code: 'INVALID_INPUT',
          message: 'Frame ID is required.',
        };
      }
      return null;

    default: {
      const exhaustiveCheck: never = input;
      return exhaustiveCheck;
    }
  }
}

export type ManagedOcrAdapter = Readonly<{
  adapter: OcrAdapter;
  run: (input: OcrImageSource, options?: OcrRunOptions) => Promise<OcrResult>;
}>;

export function createManagedOcrAdapter(
  adapter: OcrAdapter,
  context?: OcrAdapterContext,
): ManagedOcrAdapter {
  const logger = getLogger(context);

  return Object.freeze({
    adapter,
    async run(input: OcrImageSource, options: OcrRunOptions = {}): Promise<OcrResult> {
      const validationFailure = validateInput(input);

      if (validationFailure) {
        logger.error('OCR input validation failed.', validationFailure);
        return {
          ok: false,
          error: validationFailure,
        };
      }

      try {
        const available = await adapter.isAvailable();

        if (!available) {
          const error: OcrFailure = {
            code: 'ENGINE_UNAVAILABLE',
            message: `OCR engine "${adapter.engine}" is unavailable.`,
          };

          logger.error('OCR engine unavailable.', error);
          return {
            ok: false,
            error,
          };
        }

        const startedAt = nowMs(context);
        const raw = await adapter.recognize(input, options);
        const endedAt = nowMs(context);

        const normalized = normalizeOcrRawResult(
          {
            ...raw,
            durationMs: raw.durationMs > 0 ? raw.durationMs : endedAt - startedAt,
          },
          options,
        );

        logger.debug('OCR recognition completed.', {
          engine: adapter.engine,
          durationMs: normalized.durationMs,
          warnings: normalized.warnings,
        });

        return {
          ok: true,
          raw,
          normalized,
        };
      } catch (cause) {
        const error: OcrFailure = {
          code: 'RECOGNITION_FAILED',
          message:
            cause instanceof Error && cause.message.trim().length > 0
              ? cause.message
              : 'OCR recognition failed.',
          details: cause,
        };

        logger.error('OCR recognition failed.', error);

        return {
          ok: false,
          error,
        };
      }
    },
  });
}

export function createMockOcrAdapter(
  text: string = '',
): OcrAdapter {
  return {
    engine: 'mock',
    isAvailable(): boolean {
      return true;
    },
    async recognize() {
      return {
        engine: 'mock',
        text,
        blocks: text
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => ({
            text: line,
            confidence: null,
            boundingBox: null,
            lines: [
              {
                text: line,
                confidence: null,
                boundingBox: null,
                words: line.split(/\s+/).map(word => ({
                  text: word,
                  confidence: null,
                  boundingBox: null,
                })),
              },
            ],
          })),
        durationMs: 0,
      };
    },
  };
}