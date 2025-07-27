import queryString from 'query-string';
import { createContext, useContext } from 'react';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';
import { isString } from 'src/lib';
import { useEventCallback } from './utils';

export type TransientContext = Record<string, string>;

export const TransientContext = createContext<TransientContext>({});

export function useTransientContext() {
  return useContext(TransientContext);
}

export function useTransientLinkBuilder() {
  const context = useTransientContext();

  return useEventCallback((to: To) => {
    if (Object.keys(context).length === 0) {
      return to;
    }

    if (isString(to)) {
      const { url, query } = queryString.parseUrl(to);

      for (const [key, value] of Object.entries(context)) {
        query[`context.${key}`] = value;
      }

      return queryString.stringifyUrl({ url, query });
    } else if (to.search) {
      const query = queryString.parse(to.search);

      for (const [key, value] of Object.entries(context)) {
        query[`context.${key}`] = value;
      }

      return { ...to, search: `?${queryString.stringify(query)}` };
    }

    return to;
  });
}

export function useTransientNavigate() {
  const navigate = useNavigate();
  const builder = useTransientLinkBuilder();

  return useEventCallback((to: To, options?: NavigateOptions) => {
    const result = builder(to);

    navigate(result, options);
  });
}
