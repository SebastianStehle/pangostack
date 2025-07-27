import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useApi } from 'src/api';

export function useUsage() {
  const api = useApi();

  const { data: loadedUsage } = useQuery({
    queryKey: ['usage'],
    queryFn: () => api.usages.getTokenUsage(),
  });

  const items = useMemo(() => {
    const result: any[] = [];

    for (const item of loadedUsage?.items || []) {
      const clone = {
        date: format(item.date, 'yyyy-MM-dd'),
        total: item.total,
        byModel: item.byModel,
        byUser: {},
      };

      for (const [key, value] of Object.entries(item.byModel)) {
        (clone as any)[`byModel_${key}`] = value as any;
      }

      for (const [key, value] of Object.entries(item.byUser)) {
        (clone as any)[`byUser_${key}`] = value as any;
      }

      result.push(clone);
    }

    return result;
  }, [loadedUsage?.items]);

  const byModel = useBars(items, 'byModel', 'byModel_');

  return { byModel, items, totalKey: 'total' };
}

export function useRatings() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => api.usages.getRatings(),
  });

  const items = useMemo(() => {
    const result: any[] = [];

    for (const item of data?.items || []) {
      const clone = {
        date: format(item.date, 'yyyy-MM-dd'),
        total: item.total,
        byCategory: item.byCategory,
        byUser: {},
      };

      for (const [key, value] of Object.entries(item.byCategory)) {
        (clone as any)[`byCategory_${key}`] = value as any;
      }

      for (const [key, value] of Object.entries(item.byUser)) {
        (clone as any)[`byUser_${key}`] = value as any;
      }

      result.push(clone);
    }

    return result;
  }, [data?.items]);

  const byCategory = useBars(items, 'byCategory', 'byCategory_');

  return { byCategory, items, totalKey: 'total' };
}

function useBars<T extends object>(items: T[], property: keyof T, path: string) {
  const bars = useMemo(() => {
    const uniqueKeys = new Set<string>();

    for (const item of items) {
      for (const key of Object.keys(item[property] as any)) {
        uniqueKeys.add(key);
      }
    }

    return [...uniqueKeys.values()].map((key, i) => ({ key, color: getColor(i), dataKey: `${path}${key}` }));
  }, [items, path, property]);

  return bars;
}

function getColor(i: number) {
  return COLOR_PALETTE[i % COLOR_PALETTE.length];
}

const COLOR_PALETTE = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
