import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parseEnvironmentMap } from './environment';

const PREFIX = 'PANGO_TEST_ENV_';

describe('parseEnvironmentMap', () => {
  beforeAll(() => {
    process.env[`${PREFIX}FOO`] = 'bar';
    process.env[`${PREFIX}BAZ_QUX`] = 'value';
    process.env[`${PREFIX}EMPTY`] = '';
  });

  afterAll(() => {
    delete process.env[`${PREFIX}FOO`];
    delete process.env[`${PREFIX}BAZ_QUX`];
    delete process.env[`${PREFIX}EMPTY`];
  });

  it('should collect prefixed variables with lowercased keys', () => {
    const result = parseEnvironmentMap(PREFIX);

    expect(result).toMatchObject({ foo: 'bar', baz_qux: 'value' });
  });

  it('should ignore empty values', () => {
    expect(parseEnvironmentMap(PREFIX)).not.toHaveProperty('empty');
  });
});
