import { describe, expect, it } from 'vitest';
import { formatDate, getDatesInRange, parseDurationMs } from './time';

describe('getDatesInRange', () => {
  it('should return a single day when from and to are equal', () => {
    expect(getDatesInRange('2026-07-19', '2026-07-19', 90)).toEqual(['2026-07-19']);
  });

  it('should return every day in the inclusive range', () => {
    expect(getDatesInRange('2026-07-19', '2026-07-21', 90)).toEqual(['2026-07-19', '2026-07-20', '2026-07-21']);
  });

  it('should throw when the range is reversed', () => {
    expect(() => getDatesInRange('2026-07-21', '2026-07-19', 90)).toThrow('after or equal');
  });

  it('should throw when the range exceeds the maximum', () => {
    expect(() => getDatesInRange('2026-07-01', '2026-07-20', 5)).toThrow('cannot exceed');
  });
});

describe('parseDurationMs', () => {
  it('should parse each supported unit', () => {
    expect(parseDurationMs('5s')).toBe(5000);
    expect(parseDurationMs('2m')).toBe(120000);
    expect(parseDurationMs('1h')).toBe(3600000);
    expect(parseDurationMs('3d')).toBe(259200000);
  });

  it('should return null for empty or malformed input', () => {
    expect(parseDurationMs(null)).toBeNull();
    expect(parseDurationMs('')).toBeNull();
    expect(parseDurationMs('10')).toBeNull();
    expect(parseDurationMs('abc')).toBeNull();
  });
});

describe('formatDate', () => {
  it('should format a date as an UTC day string', () => {
    expect(formatDate(new Date('2026-07-19T23:30:00Z'))).toBe('2026-07-19');
  });
});
