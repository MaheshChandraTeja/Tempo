export function safeTrim(value: string | null | undefined): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function safeTrimOrNull(value: string | null | undefined): string | null {
  const trimmed = safeTrim(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function safeTrimOrFallback(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = safeTrim(value);
  return trimmed.length > 0 ? trimmed : fallback;
}