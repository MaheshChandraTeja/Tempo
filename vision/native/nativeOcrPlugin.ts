import type { NativeFrameProcessorPlugin } from '@/vision/native/frameProcessorBridge';
import type { NormalizedRect } from '@/vision/native/roiCropping';
import { createMockOcrAdapter } from '@/vision/ocr/ocr.adapter';
import type {
    OcrAdapter,
    OcrBlock,
    OcrEngineName,
    OcrImageSource,
    OcrRawResult,
    OcrRunOptions,
} from '@/vision/ocr/ocr.types';

export type NativeOcrPluginLine = Readonly<{
  text: string;
  confidence?: number | null;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}>;

export type NativeOcrPluginBlock = Readonly<{
  text: string;
  confidence?: number | null;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  lines?: NativeOcrPluginLine[];
}>;

export type NativeOcrPluginOutput = Readonly<{
  text: string;
  blocks?: NativeOcrPluginBlock[];
  engine?: string;
  durationMs?: number;
}>;

export type NativeOcrPluginOptions = Readonly<{
  roi?: NormalizedRect;
  includeBlocks?: boolean;
}>;

export type NativeOcrFramePlugin = NativeFrameProcessorPlugin<
  NativeOcrPluginOptions,
  NativeOcrPluginOutput
>;

export type NativeOcrBridge = Readonly<{
  framePlugin: NativeOcrFramePlugin | null;
  photoRecognizer?: (input: OcrImageSource, options?: OcrRunOptions) => Promise<NativeOcrPluginOutput>;
  engineName?: OcrEngineName;
}>;

function toBlocks(output: NativeOcrPluginOutput): OcrBlock[] {
  return (output.blocks ?? []).map(block => ({
    text: block.text,
    confidence: block.confidence ?? null,
    boundingBox: block.boundingBox ?? null,
    lines: (block.lines ?? []).map(line => ({
      text: line.text,
      confidence: line.confidence ?? null,
      boundingBox: line.boundingBox ?? null,
      words: line.text
        .split(/\s+/)
        .filter(Boolean)
        .map(word => ({
          text: word,
          confidence: line.confidence ?? null,
          boundingBox: null,
        })),
    })),
  }));
}

function toRawResult(
  output: NativeOcrPluginOutput,
  fallbackEngine: OcrEngineName = 'custom',
): OcrRawResult {
  return {
    engine: (output.engine as OcrEngineName | undefined) ?? fallbackEngine,
    text: output.text,
    blocks: toBlocks(output),
    durationMs: output.durationMs ?? 0,
    metadata: {
      source: 'native-ocr-bridge',
    },
  };
}

export function createNativeOcrAdapter(
  bridge: NativeOcrBridge,
): OcrAdapter {
  return {
    engine: bridge.engineName ?? 'custom',

    async isAvailable(): Promise<boolean> {
      return Boolean(bridge.framePlugin || bridge.photoRecognizer);
    },

    async recognize(
      input: OcrImageSource,
      _options: OcrRunOptions = {},
    ): Promise<OcrRawResult> {
      if (input.kind === 'frame') {
        throw new Error(
          'Frame-based OCR must be executed inside a frame processor worklet via the native plugin bridge.',
        );
      }

      if (!bridge.photoRecognizer) {
        throw new Error('Photo-based OCR recognizer is not available.');
      }

      const output = await bridge.photoRecognizer(input, _options);
      return toRawResult(output, bridge.engineName ?? 'custom');
    },
  };
}

export function createFallbackNativeOcrAdapter(): OcrAdapter {
  return createMockOcrAdapter('');
}

export function mapNativeOutputToRawResult(
  output: NativeOcrPluginOutput,
  engineName: OcrEngineName = 'custom',
): OcrRawResult {
  return toRawResult(output, engineName);
}