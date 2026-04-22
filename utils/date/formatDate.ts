export type DateInput = Date | string | number;

export type DateFormatPreset =
  | 'iso-date'
  | 'iso-datetime'
  | 'display-short'
  | 'display-medium'
  | 'weekday-short'
  | 'month-day'
  | 'time-short';

export type FormatDateOptions = Readonly<{
  preset?: DateFormatPreset;
  locale?: string;
  timeZone?: string;
  fallback?: string;
}>;

function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatIsoDateTime(date: Date): string {
  return `${formatIsoDate(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
    date.getSeconds(),
  )}`;
}

export function formatDate(
  input: DateInput,
  options: FormatDateOptions = {},
): string {
  const {
    preset = 'display-medium',
    locale = 'en-US',
    timeZone,
    fallback = '',
  } = options;

  const date = toDate(input);

  if (!date) {
    return fallback;
  }

  switch (preset) {
    case 'iso-date':
      return formatIsoDate(date);

    case 'iso-datetime':
      return formatIsoDateTime(date);

    case 'display-short':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone,
      }).format(date);

    case 'display-medium':
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone,
      }).format(date);

    case 'weekday-short':
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        timeZone,
      }).format(date);

    case 'month-day':
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        timeZone,
      }).format(date);

    case 'time-short':
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
      }).format(date);

    default: {
      const exhaustiveCheck: never = preset;
      return exhaustiveCheck;
    }
  }
}