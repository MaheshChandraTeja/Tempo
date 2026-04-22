import type { Frame } from 'react-native-vision-camera';

import type { NormalizedRect, PixelRect } from '@/vision/native/roiCropping';

export type FrameMetadata = Readonly<{
  width: number;
  height: number;
  orientation?: string;
  pixelFormat?: string;
  timestamp?: number;
  isMirrored?: boolean;
}>;

export type FrameProcessorCropRegion = Readonly<{
  normalized: NormalizedRect;
  pixels?: PixelRect;
}>;

export type FrameProcessorRequest<TOptions extends Record<string, unknown>> = Readonly<{
  frame: Frame;
  regionOfInterest?: FrameProcessorCropRegion;
  options?: TOptions;
}>;

export type FrameProcessorBridgeResult<TOutput> =
  | Readonly<{
      ok: true;
      value: TOutput;
    }>
  | Readonly<{
      ok: false;
      error: string;
    }>;

export type NativeFrameProcessorPlugin<TOptions extends Record<string, unknown>, TOutput> =
  Readonly<{
    call: (
      frame: Frame,
      options?: TOptions & {
        roi?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      },
    ) => TOutput;
  }>;

export function getFrameMetadata(frame: Frame): FrameMetadata {
  return {
    width: frame.width,
    height: frame.height,
    orientation: 'orientation' in frame ? String((frame as Record<string, unknown>).orientation ?? '') : undefined,
    pixelFormat: 'pixelFormat' in frame ? String((frame as Record<string, unknown>).pixelFormat ?? '') : undefined,
    timestamp: 'timestamp' in frame ? Number((frame as Record<string, unknown>).timestamp ?? 0) : undefined,
    isMirrored: 'isMirrored' in frame ? Boolean((frame as Record<string, unknown>).isMirrored) : undefined,
  };
}

export function buildPluginOptions<TOptions extends Record<string, unknown>>(
  request: FrameProcessorRequest<TOptions>,
): TOptions & {
  roi?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
} {
  const baseOptions = { ...(request.options ?? {}) } as TOptions & {
    roi?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  if (request.regionOfInterest) {
    baseOptions.roi = {
      x: request.regionOfInterest.normalized.x,
      y: request.regionOfInterest.normalized.y,
      width: request.regionOfInterest.normalized.width,
      height: request.regionOfInterest.normalized.height,
    };
  }

  return baseOptions;
}

export function callNativeFrameProcessor<TOptions extends Record<string, unknown>, TOutput>(
  plugin: NativeFrameProcessorPlugin<TOptions, TOutput> | null | undefined,
  request: FrameProcessorRequest<TOptions>,
): FrameProcessorBridgeResult<TOutput> {
  if (!plugin) {
    return {
      ok: false,
      error: 'Native frame processor plugin is not available.',
    };
  }

  try {
    const options = buildPluginOptions(request);
    const value = plugin.call(request.frame, options);

    return {
      ok: true,
      value,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Native frame processor call failed.',
    };
  }
}