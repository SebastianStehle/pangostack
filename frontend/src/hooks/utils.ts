import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

type Fn<ARGS extends unknown[], R> = (...args: ARGS) => R;

export const useEventCallback = <A extends unknown[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = useRef<Fn<A, R>>(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  });

  return useMemo(
    () =>
      (...args: A): R => {
        return ref.current(...args);
      },
    [ref],
  );
};

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export function useClipboard() {
  function writeText(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  return writeText;
}
