import { TransformableInfo } from 'logform';
import { describe, expect, it } from 'vitest';
import { PrettyFormat, safeStringify } from './log';

describe('PrettyFormat', () => {
  it('should replace placeholders when the message contains them', () => {
    const info: TransformableInfo = { level: 'info', message: 'Deploying {name}', name: 'my-app' };

    const result = new PrettyFormat().transform(info);

    expect(result.message).toBe('Deploying my-app');
  });

  it('should keep the placeholder name when no matching property exists', () => {
    const info: TransformableInfo = { level: 'info', message: 'Deploying {name}' };

    const result = new PrettyFormat().transform(info);

    expect(result.message).toBe('Deploying name');
  });
});

describe('safeStringify', () => {
  it('should mark circular references when the object references itself', () => {
    const obj: Record<string, unknown> = { name: 'root' };
    obj.self = obj;

    const result = safeStringify(obj, 0);

    expect(result).toBe('{"name":"root","self":"[Circular]"}');
  });
});
