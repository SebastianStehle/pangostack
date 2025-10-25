import { isUndefined } from './types';

export function assignDefined<T extends object>(target: T, source: Partial<T>) {
  const record = target as Record<string, any>;

  for (const [key, value] of Object.entries(source)) {
    if (!isUndefined(value)) {
      record[key] = value;
    }
  }

  return target;
}
