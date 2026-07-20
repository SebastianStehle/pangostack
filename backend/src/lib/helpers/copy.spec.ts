import { describe, expect, it } from 'vitest';
import { assignDefined } from './copy';

describe('assignDefined', () => {
  it('should skip undefined values and keep the existing ones', () => {
    const target = { a: 1, b: 2 };

    assignDefined(target, { a: undefined, b: 5 });

    expect(target).toEqual({ a: 1, b: 5 });
  });

  it('should assign null and false values', () => {
    const target = { a: 'x' as string | null, b: true };

    assignDefined(target, { a: null, b: false });

    expect(target).toEqual({ a: null, b: false });
  });
});
