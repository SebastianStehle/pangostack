import { describe, expect, it } from 'vitest';
import { dotToNested, parsePercent, parseSizeGb, roundValue } from './utils';

describe('parsePercent', () => {
  it('should parse a percentage and default invalid input to zero', () => {
    expect(parsePercent('12.34%')).toBe(12.34);
    expect(parsePercent('abc')).toBe(0);
    expect(parsePercent(undefined)).toBe(0);
  });
});

describe('parseSizeGb', () => {
  it('should convert size units to GB and default invalid input to zero', () => {
    expect(parseSizeGb('2GiB')).toBe(2);
    expect(parseSizeGb('512 MiB')).toBeCloseTo(0.5);
    expect(parseSizeGb('1GB')).toBe(1);
    expect(parseSizeGb('invalid')).toBe(0);
  });
});

describe('roundValue', () => {
  it('should round to two decimal places', () => {
    expect(roundValue(0.129)).toBe(0.13);
    expect(roundValue(2)).toBe(2);
  });
});

describe('dotToNested', () => {
  it('should build nested objects when keys contain dots', () => {
    const result = dotToNested({ 'a.b.c': 'value' });

    expect(result).toEqual({ a: { b: { c: 'value' } } });
  });

  it('should convert values when strings represent numbers or booleans', () => {
    const result = dotToNested({ number: '42', negative: '-1', truthy: 'true', falsy: 'FALSE', text: 'hello' });

    expect(result).toEqual({ number: 42, negative: -1, truthy: true, falsy: false, text: 'hello' });
  });

  it('should strip surrounding quotes when string values are quoted', () => {
    const result = dotToNested({ quoted: '"hello"' });

    expect(result).toEqual({ quoted: 'hello' });
  });

  it('should build arrays when key parts are numeric indexes', () => {
    const result = dotToNested({ 'items.0.name': 'first', 'items.1.name': 'second' });

    expect(result).toEqual({ items: [{ name: 'first' }, { name: 'second' }] });
  });

  it('should keep dots in keys when they are escaped', () => {
    const result = dotToNested({ 'a\\.b': 'value' });

    expect(result).toEqual({ 'a.b': 'value' });
  });
});
