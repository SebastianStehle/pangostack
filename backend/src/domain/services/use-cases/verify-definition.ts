import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { ServiceEntity, ServiceRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters, ServiceDefinition } from 'src/domain/definitions';
import { WorkerClient, WorkerResponseError } from 'src/domain/workers';
import { is, isNumber } from 'src/lib';
import { getResourceUniqueId } from '../libs';

export class VerifyDefinitionQuery extends Query<VerifyDefinitionResult> {
  constructor(
    public readonly serviceId: number,
    public readonly definition: ServiceDefinition,
    public readonly environment: Record<string, string>,
  ) {
    super();
  }
}

export class VerifyDefinitionResult {}

@QueryHandler(VerifyDefinitionQuery)
export class VerifyDefinitionHandler implements IQueryHandler<VerifyDefinitionQuery, VerifyDefinitionResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(query: VerifyDefinitionQuery): Promise<VerifyDefinitionResult> {
    const { definition, environment, serviceId } = query;

    const service = await this.services.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    const parameters: Record<string, any> = {};
    for (const parameterDefinition of definition.parameters) {
      let value: any;
      switch (parameterDefinition.type) {
        case 'boolean':
          value = true;
          break;
        case 'number':
          let step = 1;
          if (isNumber(parameterDefinition.step)) {
            step = parameterDefinition.step;
          }

          if (parameterDefinition.allowedValues && parameterDefinition.allowedValues.length > 0) {
            value = parameterDefinition.allowedValues[0].value;
          } else if (isNumber(parameterDefinition.minValue)) {
            value = parameterDefinition.minValue + step;
          } else if (isNumber(parameterDefinition.maxValue)) {
            value = parameterDefinition.maxValue - step;
          } else {
            value = 0;
          }
          break;
        case 'string':
          function stringOfLength(length: number) {
            let result = '';
            for (let i = 0; i < length; i++) {
              result += '0';
            }
            return result;
          }

          if (parameterDefinition.allowedValues && parameterDefinition.allowedValues.length > 0) {
            value = parameterDefinition.allowedValues[0].value;
          } else if (isNumber(parameterDefinition.minLength)) {
            value = stringOfLength(parameterDefinition.minLength + 1);
          } else if (isNumber(parameterDefinition.maxLength)) {
            value = stringOfLength(parameterDefinition.maxLength - 1);
          } else {
            value = stringOfLength(3);
          }
          break;
      }

      parameters[parameterDefinition.name] = value;
    }

    const context = { env: { ...service.environment, ...environment }, context: new Dynamic(), parameters };
    const client = new WorkerClient(worker.endpoint, worker.apiKey);

    for (const resource of definition.resources) {
      try {
        await client.deployment.verifyResource({
          parameters: evaluateParameters(resource, context),
          resourceContext: {},
          resourceUniqueId: getResourceUniqueId(0, resource),
          resourceType: resource.type,
          timeoutMs: 1 * 60 * 1000, // 1 minute
        });
      } catch (ex: any) {
        if (is(ex, WorkerResponseError) && ex.status === 400) {
          throw new BadRequestException(ex.body);
        } else {
          throw ex;
        }
      }
    }

    return new VerifyDefinitionResult();
  }
}

class Dynamic {
  constructor() {
    return new Proxy(this, {
      get: (_, property) => {
        if (property === 'toString') {
          return () => '000';
        }

        return new Dynamic();
      },
    });
  }

  toString() {
    return '000';
  }
}
