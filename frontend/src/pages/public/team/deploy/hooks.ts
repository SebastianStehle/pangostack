import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { ObjectShape } from 'yup';
import { ServicePublicDto } from 'src/api';
import { isNumber } from 'src/lib';
import { DeploymentUpdate } from './DeploymentForm';

export function useDeploymentResolver(service: ServicePublicDto) {
  const resolver = useMemo(() => {
    const shape: ObjectShape = {};

    for (const parameter of service.parameters) {
      const label = parameter.label || parameter.name;

      if (parameter.type === 'boolean') {
        let boolean = Yup.bool().label(label);

        if (parameter.required) {
          boolean = boolean.required();
        }

        shape[parameter.name] = boolean;
      } else if (parameter.type === 'number') {
        let number = Yup.number().label(label);

        if (parameter.required) {
          number = number.required();
        }

        if (isNumber(parameter.minValue)) {
          number = number.min(parameter.minValue);
        }

        if (isNumber(parameter.maxValue)) {
          number = number.max(parameter.maxValue);
        }

        shape[parameter.name] = number;
      } else if (parameter.type === 'string') {
        let string = Yup.string().label(label);

        if (parameter.required) {
          string = string.required();
        }

        if (isNumber(parameter.minLength)) {
          string = string.min(parameter.minLength);
        }

        if (isNumber(parameter.maxLength)) {
          string = string.max(parameter.maxLength);
        }

        shape[parameter.name] = string;
      }
    }

    const schema = Yup.object().shape({
      name: Yup.string().max(100).nullable(),

      parameters: Yup.object().shape(shape),
    });

    return yupResolver<DeploymentUpdate>(schema as any);
  }, [service]);

  return resolver;
}
