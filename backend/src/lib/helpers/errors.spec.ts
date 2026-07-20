import { ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { flattenValidationErrors, InternalError } from './errors';

describe('flattenValidationErrors', () => {
  it('should render a flat error with the property substituted', () => {
    const errors: ValidationError[] = [{ property: 'name', constraints: { isDefined: '$property is required' } }];

    expect(flattenValidationErrors(errors)).toEqual(['name is required']);
  });

  it('should prefix nested errors with the parent path', () => {
    const errors: ValidationError[] = [
      { property: 'parent', children: [{ property: 'child', constraints: { isString: '$property must be a string' } }] },
    ];

    expect(flattenValidationErrors(errors)).toEqual(['parent.child must be a string']);
  });
});

describe('InternalError', () => {
  it('should use the content as the message', () => {
    expect(new InternalError('boom').message).toBe('boom');
  });

  it('should append a serialized cause', () => {
    const error = new InternalError('boom', { cause: { code: 42 } });

    expect(error.message).toContain('boom');
    expect(error.message).toContain('Caused by');
    expect(error.message).toContain('42');
  });
});
