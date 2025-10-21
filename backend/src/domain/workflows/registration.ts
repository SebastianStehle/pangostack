/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

export const ACTIVITY_METADATA = 'ACTIVITY';

export function Activity<T, R>(activityFunction: (param: T) => Promise<R>): ClassDecorator {
  return <TFunction extends Function>(target: TFunction) => {
    Reflect.defineMetadata(ACTIVITY_METADATA, { name: activityFunction.name }, target);
  };
}

export interface Activity<T, R = any> {
  execute: (param: T) => Promise<R>;
}

@Injectable()
export class ActivityExplorerService {
  private cached: Record<string, any>;

  constructor(private readonly modulesContainer: ModulesContainer) {}

  get activities() {
    if (this.cached) {
      return this.cached;
    }

    const allActivities: Record<string, any>[] = [];
    for (const module of this.modulesContainer.values()) {
      const providers = module.providers;

      for (const wrapper of providers.values()) {
        if (!wrapper) {
          continue;
        }

        const instance = wrapper.instance;
        if (!instance || !instance.constructor) {
          continue;
        }

        const metadata = Reflect.getMetadata(ACTIVITY_METADATA, instance.constructor);
        if (!metadata) {
          continue;
        }

        const executeMethod = (instance as Activity<any>).execute.bind(instance);
        allActivities[metadata.name] = executeMethod;
      }
    }

    this.cached = allActivities;
    return this.cached;
  }
}
