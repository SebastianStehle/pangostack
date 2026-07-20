import { describe, expect, it } from 'vitest';
import { isDate, isNumber, isObject, isString } from './types';

describe('isNumber', () => {
  it('should accept finite numbers only', () => {
    expect(isNumber(5)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNumber('5')).toBe(false);
  });
});

describe('isObject', () => {
  it('should accept plain objects only', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(new Date())).toBe(false);
  });
});

describe('isString', () => {
  it('should accept string values', () => {
    expect(isString('x')).toBe(true);
    expect(isString(5)).toBe(false);
  });
});

describe('isDate', () => {
  it('should accept Date instances only', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate('2026-07-19')).toBe(false);
  });
});
