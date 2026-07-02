import { describe, expect, it } from 'vitest';
import { dotToNested } from './utils';

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
