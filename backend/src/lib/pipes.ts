import { assignMetadata, BadRequestException, PipeTransform, Type } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { isString } from 'class-validator';
import { isNull, isUndefined } from './types';

export const IntParam = (paramName: string) =>
  createPipesRouteParamDecorator(RouteParamtypes.PARAM)(paramName, {
    transform: (value: any) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new BadRequestException(`Parameter "${paramName}" must be an integer.`);
      }
      return parsed;
    },
  });

export const IntQuery = (paramName: string, defaultValue = 0) =>
  createPipesRouteParamDecorator(RouteParamtypes.QUERY)(paramName, {
    transform: (value: any) => {
      if (!isString(value)) {
        return defaultValue;
      }

      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        return defaultValue;
      }

      return parsed;
    },
  });

function createPipesRouteParamDecorator(paramtype: RouteParamtypes) {
  return (data?: any, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator =>
    (target, key, index) => {
      const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key!) || {};

      const hasParamData = isUndefined(data) || isNull(data) || isString(data);

      const paramData = hasParamData ? data : undefined;
      const paramPipes = hasParamData ? pipes : [data, ...pipes];

      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(args, paramtype, index, paramData!, ...paramPipes),
        target.constructor,
        key!,
      );
    };
}
