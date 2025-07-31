/* eslint-disable @typescript-eslint/ban-types */

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

export function isEquals(lhs: any, rhs: any, lazyString = false) {
  if (lhs === rhs || (lhs !== lhs && rhs !== rhs)) {
    return true;
  }

  if (lazyString) {
    const result = (lhs === '' && isUndefined(rhs)) || (rhs === '' && isUndefined(lhs));

    if (result) {
      return true;
    }
  }

  if (!lhs || !rhs) {
    return false;
  }

  if (isArray(lhs) && isArray(rhs)) {
    if (lhs.length !== rhs.length) {
      return false;
    }

    for (let i = 0; i < lhs.length; i++) {
      if (!isEquals(lhs[i], rhs[i], lazyString)) {
        return false;
      }
    }

    return true;
  } else if (isObject(lhs) && isObject(rhs)) {
    if (Object.keys(lhs).length !== Object.keys(rhs).length) {
      return false;
    }

    for (const key in lhs) {
      if (lhs.hasOwnProperty(key)) {
        if (!isEquals(lhs[key], rhs[key], lazyString)) {
          return false;
        }
      }
    }

    return true;
  }

  return false;
}
