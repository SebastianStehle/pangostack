import { useCallback, useEffect, useState } from 'react';

export function useStoredState(defaultValue: boolean, key: string): [boolean, (value: boolean) => void] {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const fromLocalStore = localStorage.getItem(key);

    setState(fromLocalStore !== 'false');
  }, [key]);

  const update = useCallback(
    (value: boolean) => {
      setState(value);
      localStorage.setItem(key, `${value}`);
    },
    [key],
  );

  return [state, update];
}
