export type RoundMode = 'nearest' | 'up' | 'down';

export type RoundOptions = Readonly<{
  decimals?: number;
  mode?: RoundMode;
}>;

function getFactor(decimals: number): number {
  return 10 ** decimals;
}

export function round(
  value: number,
  options: RoundOptions = {},
): number {
  const { decimals = 0, mode = 'nearest' } = options;

  if (!Number.isFinite(value)) {
    return value;
  }

  const factor = getFactor(decimals);
  const scaled = value * factor;

  switch (mode) {
    case 'nearest':
      return Math.round(scaled) / factor;
    case 'up':
      return Math.ceil(scaled) / factor;
    case 'down':
      return Math.floor(scaled) / factor;
    default: {
      const exhaustiveCheck: never = mode;
      return exhaustiveCheck;
    }
  }
}

export function roundToDecimals(value: number, decimals = 0): number {
  return round(value, { decimals, mode: 'nearest' });
}