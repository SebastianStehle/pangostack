import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useParam = <T>(key: string, defaultValue: string): [T, (value: T) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    return (searchParams.get(key) ?? defaultValue) as T;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: T) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (newValue === defaultValue || newValue === '' || newValue === null || newValue === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(newValue));
        }

        return next;
      });
    },
    [key, defaultValue, setSearchParams],
  );

  return [value, setValue];
};
