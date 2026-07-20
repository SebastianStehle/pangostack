import { describe, expect, it } from 'vitest';
import { getPagination, MAX_PAGE_SIZE } from './pagination';

describe('getPagination', () => {
  it('should compute skip and take when page and size are valid', () => {
    expect(getPagination(2, 20)).toEqual({ skip: 40, take: 20 });
  });

  it('should clamp the size to the maximum when it is too large', () => {
    expect(getPagination(0, MAX_PAGE_SIZE + 50)).toEqual({ skip: 0, take: MAX_PAGE_SIZE });
  });

  it('should fall back to safe values when the input is invalid', () => {
    expect(getPagination(Number.NaN, -5)).toEqual({ skip: 0, take: 1 });
  });
});
