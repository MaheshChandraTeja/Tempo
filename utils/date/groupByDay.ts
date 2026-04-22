import type { DateInput } from '@/utils/date/formatDate';
import { startOfDayIso } from '@/utils/date/startOfDay';

export type GroupedByDay<T> = Readonly<Record<string, T[]>>;

export type GroupByDayOptions<T> = Readonly<{
  getDate: (item: T) => DateInput;
  includeInvalid?: boolean;
  invalidKey?: string;
}>;

export function groupByDay<T>(
  items: readonly T[],
  options: GroupByDayOptions<T>,
): GroupedByDay<T> {
  const {
    getDate,
    includeInvalid = false,
    invalidKey = '__invalid__',
  } = options;

  const grouped: Record<string, T[]> = {};

  for (const item of items) {
    const key = startOfDayIso(getDate(item));

    if (!key) {
      if (!includeInvalid) {
        continue;
      }

      if (!grouped[invalidKey]) {
        grouped[invalidKey] = [];
      }

      grouped[invalidKey].push(item);
      continue;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(item);
  }

  return grouped;
}