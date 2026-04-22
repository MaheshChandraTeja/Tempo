import type { DateInput } from '@/utils/date/formatDate';

function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(input: DateInput): Date | null {
  const date = toDate(input);

  if (!date) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfDayTimestamp(input: DateInput): number | null {
  const date = startOfDay(input);
  return date ? date.getTime() : null;
}

export function startOfDayIso(input: DateInput): string | null {
  const date = startOfDay(input);

  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}