import queryString from 'query-string';
import { useMemo } from 'react';
import { TransientContext } from 'src/hooks';
import { isArray } from 'src/lib';

export const TransientProvider = (props: React.PropsWithChildren) => {
  const { children } = props;

  const values = useMemo(() => {
    const result: Record<string, string> = {};
    const parsed = queryString.parse(location.search);
    const prefix = 'context.';

    for (const [key, value] of Object.entries(parsed)) {
      if (key.indexOf(prefix) !== 0) {
        continue;
      }

      let actualValue: string | null;
      if (isArray(value)) {
        actualValue = value[0];
      } else {
        actualValue = value;
      }

      if (actualValue && actualValue.length > 0) {
        const withoutContext = key.substring(prefix.length);

        result[withoutContext] = actualValue;
      }
    }

    return result;
  }, []);

  return <TransientContext.Provider value={values}>{children}</TransientContext.Provider>;
};
