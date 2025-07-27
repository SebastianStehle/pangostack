import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { ExtensionDto, ExtensionSpecDto } from 'src/api';
import { isNumber } from 'src/lib';

export function useListValues(spec: ExtensionSpecDto, extension?: ExtensionDto) {
  return useMemo(() => {
    const result: string[] = [];

    if (!extension) {
      return result;
    }

    for (const [name, arg] of Object.entries(spec.arguments)) {
      if (!arg.showInList) {
        continue;
      }

      const value = extension.values[name];

      if (value) {
        result.push(`${value}`);
      }
    }

    return result;
  }, [extension, spec.arguments]);
}

export function useCleanedExtension(spec: ExtensionSpecDto, extension: ExtensionDto) {
  return useMemo(() => {
    const clone = { ...extension };
    clone.values = { ...extension.values };

    for (const key of Object.keys(clone.values)) {
      if (!spec.arguments[key]) {
        delete clone.values[key];
      }
    }

    return clone;
  }, [extension, spec.arguments]);
}

export function useSpecResolver(spec?: ExtensionSpecDto) {
  return useMemo(() => {
    const values: { [name: string]: any } = {};

    for (const [name, arg] of Object.entries(spec?.arguments || {})) {
      if (arg.type === 'number') {
        let type: Yup.NumberSchema<number | undefined | null> = Yup.number().label(arg.label);

        if (arg.required) {
          type = type.required();
        }

        if (isNumber(arg.min)) {
          type = type.min(arg.min);
        }

        if (isNumber(arg.max)) {
          type = type.min(arg.max);
        }

        values[name] = type;
      } else if (arg.type === 'string') {
        let type: Yup.StringSchema<string | undefined | null> = Yup.string().label(arg.label);

        if (arg.required) {
          type = type.required();
        }

        values[name] = type;
      }
    }

    const schema = Yup.object().shape({
      values: Yup.object(values),
    });
    return yupResolver<any>(schema);
  }, [spec]);
}
