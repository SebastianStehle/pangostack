import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { ServiceEntity, ServiceRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters, ParameterDefinition, ServiceDefinition } from 'src/domain/definitions';
import { ResourceValueDto, WorkerClient, WorkerResponseError } from 'src/domain/workers';
import { is, isNumber } from 'src/lib';
import { getResourceUniqueId, updateContext } from '../libs';

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
      parameters[parameterDefinition.name] = generateParameter(parameterDefinition);
    }

    const context = { env: { ...service.environment, ...environment }, context: {} as Record<string, any>, parameters };
    const client = new WorkerClient(worker.endpoint, worker.apiKey);

    const workerResources = await client.resources.getResources();

    for (const resource of definition.resources) {
      const workerResource = workerResources.items.find((x) => x.name === resource.type);
      if (!workerResource) {
        throw new BadRequestException(`resource.${resource.id} has unknown resoruce type ${resource.type}`);
      }

      try {
        await client.deployment.verifyResource({
          parameters: evaluateParameters(resource, context),
          resourceContext: {},
          resourceUniqueId: getResourceUniqueId(0, resource),
          resourceType: resource.type,
          timeoutMs: 1 * 60 * 1000, // 1 minute
        });

        const resourceContext: Record<string, any> = {};
        for (const [name, contextValue] of Object.entries(workerResource.context)) {
          resourceContext[name] = generateContext(contextValue);
        }

        updateContext(resource.id, context.context, resourceContext);
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

function generateContext(parameter: ResourceValueDto) {
  switch (parameter.type) {
    case 'number':
      return 0;
    case 'string':
      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return parameter.allowedValues[0];
      } else if (isNumber(parameter.minLength)) {
        return stringOfLength(parameter.minLength + 1);
      } else if (isNumber(parameter.maxLength)) {
        return stringOfLength(parameter.maxLength - 1);
      } else {
        return stringOfLength(3);
      }

    default:
      return true;
  }
}

function generateParameter(parameter: ParameterDefinition) {
  switch (parameter.type) {
    case 'number':
      let step = 1;
      if (isNumber(parameter.step)) {
        step = parameter.step;
      }

      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return parameter.allowedValues[0].value;
      } else if (isNumber(parameter.minValue)) {
        return parameter.minValue + step;
      } else if (isNumber(parameter.maxValue)) {
        return parameter.maxValue - step;
      } else {
        return 0;
      }
    case 'string':
      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return parameter.allowedValues[0].value;
      } else if (isNumber(parameter.minLength)) {
        return stringOfLength(parameter.minLength + 1);
      } else if (isNumber(parameter.maxLength)) {
        return stringOfLength(parameter.maxLength - 1);
      } else {
        return stringOfLength(3);
      }

    default:
      return true;
  }
}

function stringOfLength(length: number) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += '0';
  }
  return result;
}
