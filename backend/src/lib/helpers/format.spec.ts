import { TransformableInfo } from 'logform';
import { describe, expect, it } from 'vitest';
import { prettyFormat } from './format';

describe('prettyFormat', () => {
  function transform(info: TransformableInfo) {
    return prettyFormat().transform(info) as TransformableInfo;
  }

  it('should replace placeholders with the matching info values', () => {
    const result = transform({ level: 'info', message: 'Hello {name}', name: 'World' });

    expect(result.message).toBe('Hello World');
  });

  it('should keep the placeholder name when the value is missing', () => {
    const result = transform({ level: 'info', message: '{missing}' });

    expect(result.message).toBe('missing');
  });

  it('should pass the info through when there is no message', () => {
    const info = { level: 'info', message: '' };

    expect(transform(info)).toBe(info);
  });
});
