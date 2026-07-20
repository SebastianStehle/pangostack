import { describe, expect, it } from 'vitest';
import { last } from './arrays';

describe('last', () => {
  it('should return the last element', () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it('should return undefined for an empty array', () => {
    expect(last([])).toBeUndefined();
  });
});
