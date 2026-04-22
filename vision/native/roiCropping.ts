export type NormalizedRect = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type PixelRect = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type FrameSize = Readonly<{
  width: number;
  height: number;
}>;

export type RoiPreset =
  | 'full-frame'
  | 'center-panel'
  | 'upper-middle'
  | 'lower-middle';

export type RoiPadding = Readonly<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}>;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function clampPositive(value: number): number {
  return value < 0 ? 0 : value;
}

export function normalizeRect(rect: NormalizedRect): NormalizedRect {
  const x = clamp01(rect.x);
  const y = clamp01(rect.y);
  const width = clamp01(rect.width);
  const height = clamp01(rect.height);

  const maxWidth = clampPositive(1 - x);
  const maxHeight = clampPositive(1 - y);

  return {
    x,
    y,
    width: Math.min(width, maxWidth),
    height: Math.min(height, maxHeight),
  };
}

export function applyRoiPadding(
  rect: NormalizedRect,
  padding: RoiPadding = {},
): NormalizedRect {
  const next: NormalizedRect = {
    x: rect.x - (padding.left ?? 0),
    y: rect.y - (padding.top ?? 0),
    width: rect.width + (padding.left ?? 0) + (padding.right ?? 0),
    height: rect.height + (padding.top ?? 0) + (padding.bottom ?? 0),
  };

  return normalizeRect(next);
}

export function normalizedRectToPixels(
  rect: NormalizedRect,
  frame: FrameSize,
): PixelRect {
  const normalized = normalizeRect(rect);

  return {
    x: Math.round(normalized.x * frame.width),
    y: Math.round(normalized.y * frame.height),
    width: Math.round(normalized.width * frame.width),
    height: Math.round(normalized.height * frame.height),
  };
}

export function pixelsToNormalizedRect(
  rect: PixelRect,
  frame: FrameSize,
): NormalizedRect {
  if (frame.width <= 0 || frame.height <= 0) {
    return {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
  }

  return normalizeRect({
    x: rect.x / frame.width,
    y: rect.y / frame.height,
    width: rect.width / frame.width,
    height: rect.height / frame.height,
  });
}

export function getRoiPreset(preset: RoiPreset): NormalizedRect {
  switch (preset) {
    case 'full-frame':
      return { x: 0, y: 0, width: 1, height: 1 };

    case 'center-panel':
      return { x: 0.12, y: 0.24, width: 0.76, height: 0.42 };

    case 'upper-middle':
      return { x: 0.15, y: 0.14, width: 0.7, height: 0.28 };

    case 'lower-middle':
      return { x: 0.15, y: 0.42, width: 0.7, height: 0.28 };

    default: {
      const exhaustiveCheck: never = preset;
      return exhaustiveCheck;
    }
  }
}

export function getDefaultTreadmillDisplayRoi(): NormalizedRect {
  return getRoiPreset('center-panel');
}

export function mirrorRectHorizontally(rect: NormalizedRect): NormalizedRect {
  const normalized = normalizeRect(rect);

  return {
    x: clamp01(1 - normalized.x - normalized.width),
    y: normalized.y,
    width: normalized.width,
    height: normalized.height,
  };
}

export function describeRoi(rect: NormalizedRect): string {
  const normalized = normalizeRect(rect);

  return `x=${normalized.x.toFixed(3)}, y=${normalized.y.toFixed(3)}, width=${normalized.width.toFixed(
    3,
  )}, height=${normalized.height.toFixed(3)}`;
}