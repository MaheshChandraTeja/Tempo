function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

export function withOpacity(color: string, opacity: number): string {
  const normalized = color.replace('#', '');
  const alpha = clampOpacity(opacity);

  if (normalized.length !== 3 && normalized.length !== 6) {
    return color;
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(channel => `${channel}${channel}`)
          .join('')
      : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  if ([red, green, blue].some(channel => Number.isNaN(channel))) {
    return color;
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
