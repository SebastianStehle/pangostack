import { describe, expect, it } from 'vitest';
import { parseEnvironment } from './environment';

describe('parseEnvironment', () => {
  it('should return an empty object when text is null or blank', () => {
    expect(parseEnvironment(null)).toEqual({});
    expect(parseEnvironment('   ')).toEqual({});
  });

  it('should parse key value pairs and skip invalid lines when text contains mixed content', () => {
    const text = ['KEY1=value1', '', 'NO_SEPARATOR', '=no-key', '  KEY2 =value=with=equals'].join('\n');

    expect(parseEnvironment(text)).toEqual({ KEY1: 'value1', KEY2: 'value=with=equals' });
  });
});
