/* eslint-disable @typescript-eslint/ban-types */
import { ResponseError } from 'src/api';
import { texts } from 'src/texts';

export function delay(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isObject(value: any): value is Object {
  return value && typeof value === 'object' && value.constructor === Object;
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: any): value is null {
  return value === null;
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isRegExp(value: any): value is RegExp {
  return value && typeof value === 'object' && value.constructor === RegExp;
}

export function isDate(value: any): value is Date {
  return value instanceof Date;
}

export function is<TClass>(x: any, c: new (...args: any[]) => TClass): x is TClass {
  return x instanceof c;
}

export function formatFileSize(value: number, factor = 1024) {
  let u = 0;

  while (value >= factor || -value >= factor) {
    value /= factor;
    u++;
  }

  return (u ? `${value.toFixed(1)} ` : value) + ' kMGTPEZY'[u] + 'B';
}

export async function buildError(common: string, details?: string | Error | null) {
  let result = common;

  let detailString: string | null = null;
  if (isString(details)) {
    detailString = details;
  } else if (is(details, ResponseError)) {
    try {
      const response = await details.response.json();

      detailString = response.message;
    } catch {
      console.error('Server response is an not a JSON object.');
    }
  }

  if (isString(detailString)) {
    if (result.endsWith('.')) {
      result = result.substring(0, result.length - 1);
    }

    result = `${result}: ${detailString}`;
  }

  if (!result.endsWith('.')) {
    result = `${result}.`;
  }

  return result;
}

export function formatBoolean(value: boolean) {
  return value ? texts.common.yes : texts.common.no;
}

export function formatTags(value?: string[]) {
  return value?.join(', ') || '';
}
