/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && value.constructor === Object;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isRegExp(value: unknown): value is RegExp {
  return !!value && typeof value === 'object' && value.constructor === RegExp;
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function is<TClass>(x: any, c: new (...args: any[]) => TClass): x is TClass {
  return x instanceof c;
}

export type Optional<T> = {
  [P in keyof T]?: T[P];
};
