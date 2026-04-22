import { useEffect, useRef, useState } from 'react';

type UseDebouncedValueOptions<T> = Readonly<{
  delayMs?: number;
  equalityFn?: (left: T, right: T) => boolean;
}>;

export function useDebouncedValue<T>(
  value: T,
  options: UseDebouncedValueOptions<T> = {},
): T {
  const {
    delayMs = 300,
    equalityFn = Object.is,
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    if (equalityFn(previousValueRef.current, value)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      previousValueRef.current = value;
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delayMs, equalityFn, value]);

  return debouncedValue;
}