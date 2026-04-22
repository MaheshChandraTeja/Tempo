export type ClampOptions = Readonly<{
  min?: number;
  max?: number;
}>;

export function clamp(value: number, options: ClampOptions = {}): number {
  const { min, max } = options;

  if (!Number.isFinite(value)) {
    return value;
  }

  let next = value;

  if (typeof min === 'number' && next < min) {
    next = min;
  }

  if (typeof max === 'number' && next > max) {
    next = max;
  }

  return next;
}

export function isWithinRange(
  value: number,
  options: Required<ClampOptions>,
): boolean {
  return value >= options.min && value <= options.max;
}