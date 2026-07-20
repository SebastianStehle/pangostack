import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './expression';

describe('evaluateExpression', () => {
  it('should return the template unchanged when it has no expressions', () => {
    expect(evaluateExpression('plain text', {})).toBe('plain text');
  });

  it('should evaluate arithmetic expressions', () => {
    expect(evaluateExpression('${1 + 2}', {})).toBe('3');
  });

  it('should resolve values from the context', () => {
    expect(evaluateExpression('db=${parameters.name}', { parameters: { name: 'orders' } })).toBe('db=orders');
  });

  it('should interpolate multiple expressions', () => {
    expect(evaluateExpression('${x}-${y}', { x: 1, y: 2 })).toBe('1-2');
  });

  it('should return an empty string for an empty or missing template', () => {
    expect(evaluateExpression('', {})).toBe('');
    expect(evaluateExpression(undefined, {})).toBe('');
  });

  it('should swallow evaluation errors and yield an empty segment', () => {
    expect(evaluateExpression('${missing.deeply.nested}', {})).toBe('');
  });
});
