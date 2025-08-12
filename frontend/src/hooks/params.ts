import { useParams as useRRParams } from 'react-router-dom';

type TypeMapValue = 'int' | 'float' | 'bool' | 'string';

type ParsedType<T extends TypeMapValue> = T extends 'int'
  ? number
  : T extends 'float'
    ? number
    : T extends 'bool'
      ? boolean
      : string;

type ParsedParams<T extends Record<string, TypeMapValue>> = {
  [K in keyof T]: ParsedType<T[K]>;
};

function parseValue(value: string | undefined, type: TypeMapValue) {
  if (value == null) return null;

  switch (type) {
    case 'int': {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    }
    case 'float': {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    case 'bool': {
      return value === 'true' || value === '1';
    }
    case 'string':
    default:
      return value;
  }
}

export function useTypedParams<T extends Record<string, TypeMapValue>>(typeMap: T): ParsedParams<T> {
  const rawParams = useRRParams();
  const parsedParams = {} as ParsedParams<T>;

  for (const key in typeMap) {
    parsedParams[key] = parseValue(rawParams[key], typeMap[key]) as ParsedParams<T>[typeof key];
  }

  return parsedParams;
}
