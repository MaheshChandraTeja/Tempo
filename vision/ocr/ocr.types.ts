export type OcrEngineName =
  | 'mock'
  | 'native-mlkit'
  | 'tesseract'
  | 'vision-api'
  | 'custom';

export type OcrInputKind = 'photo-file' | 'image-uri' | 'frame';

export type OcrBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type OcrConfidence = number | null;

export type OcrWord = Readonly<{
  text: string;
  confidence: OcrConfidence;
  boundingBox: OcrBoundingBox | null;
}>;

export type OcrLine = Readonly<{
  text: string;
  confidence: OcrConfidence;
  boundingBox: OcrBoundingBox | null;
  words: OcrWord[];
}>;

export type OcrBlock = Readonly<{
  text: string;
  confidence: OcrConfidence;
  boundingBox: OcrBoundingBox | null;
  lines: OcrLine[];
}>;

export type OcrRawResult = Readonly<{
  engine: OcrEngineName;
  text: string;
  blocks: OcrBlock[];
  durationMs: number;
  metadata?: Record<string, unknown>;
}>;

export type OcrNormalizedResult = Readonly<{
  engine: OcrEngineName;
  rawText: string;
  normalizedText: string;
  lines: string[];
  tokens: string[];
  durationMs: number;
  warnings: string[];
  metadata?: Record<string, unknown>;
}>;

export type OcrFailure = Readonly<{
  code:
    | 'INVALID_INPUT'
    | 'ENGINE_UNAVAILABLE'
    | 'RECOGNITION_FAILED'
    | 'TIMEOUT'
    | 'UNKNOWN';
  message: string;
  details?: unknown;
}>;

export type OcrSuccess = Readonly<{
  ok: true;
  raw: OcrRawResult;
  normalized: OcrNormalizedResult;
}>;

export type OcrError = Readonly<{
  ok: false;
  error: OcrFailure;
}>;

export type OcrResult = OcrSuccess | OcrError;

export type OcrImageSource = Readonly<
  | {
      kind: 'photo-file';
      path: string;
      width?: number;
      height?: number;
      mimeType?: string;
    }
  | {
      kind: 'image-uri';
      uri: string;
      width?: number;
      height?: number;
      mimeType?: string;
    }
  | {
      kind: 'frame';
      frameId: string;
      width?: number;
      height?: number;
      timestampMs?: number;
    }
>;

export type OcrRunOptions = Readonly<{
  timeoutMs?: number;
  uppercase?: boolean;
  preserveLineBreaks?: boolean;
  includeDebugMetadata?: boolean;
}>;

export type OcrAdapterContext = Readonly<{
  now?: () => number;
  logger?: {
    debug: (message: string, details?: unknown) => void;
    error: (message: string, details?: unknown) => void;
  };
}>;

export interface OcrAdapter {
  readonly engine: OcrEngineName;
  isAvailable(): Promise<boolean> | boolean;
  recognize(
    input: OcrImageSource,
    options?: OcrRunOptions,
  ): Promise<OcrRawResult>;
}