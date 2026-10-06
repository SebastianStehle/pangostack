import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { subHours } from 'date-fns';
import { LessThan } from 'typeorm';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  OrphanedResourceEntity,
  OrphanedResourceRepository,
  ServiceVersionEntity,
  ServiceVersionRepository,
} from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { CurrentDeploymentResources, isOrphanedResource } from 'src/domain/orphans';
import { getEvaluationContext } from 'src/domain/services';
import { WorkerError, WorkerResolver } from 'src/domain/workers';
import { Activity } from '../registration';

export type ScanOrphanGroupParam = {
  serviceVersionId: number;
  resourceDefinitionId: string;
  runStartedAt: string;
};

export type ScanOrphanGroupResult = { scanned: boolean; found: number; removed: number };

// Nothing younger than this is ever reported, because a deployment update may still be running.
const GRACE_PERIOD_HOURS = 24;

const NOT_IMPLEMENTED = 501;
const NOT_SCANNED: ScanOrphanGroupResult = { scanned: false, found: 0, removed: 0 };

@Activity(scanOrphanGroup)
export class ScanOrphanGroupActivity implements Activity<ScanOrphanGroupParam, ScanOrphanGroupResult> {
  private readonly logger = new Logger(ScanOrphanGroupActivity.name);

  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(OrphanedResourceEntity)
    private readonly orphanedResources: OrphanedResourceRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute({ resourceDefinitionId, runStartedAt, serviceVersionId }: ScanOrphanGroupParam) {
    const version = await this.serviceVersions.findOneBy({ id: serviceVersionId });
    if (!version) {
      throw new NotFoundException(`Service Version ${serviceVersionId} not found.`);
    }

    const resource = version.definition.resources.find((x) => x.id === resourceDefinitionId);
    if (!resource) {
      // The resource was removed from the definition between planning and scanning.
      return NOT_SCANNED;
    }

    const workers = await this.workerResolver.getWorkers();

    const worker = workers.get(resource.type);
    if (!worker) {
      return NOT_SCANNED;
    }

    const update = await this.deploymentUpdates.findOne({
      where: { serviceVersionId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    // The environment is merged the same way a deployment merges it, because a credential can be
    // defined on the service as well and the version only overwrites it.
    const env = { ...version.service.environment, ...version.environment };

    // The current environment wins over the one a deployment was created with, so that a rotated
    // credential is used. The deployment only fills in the remaining parameters of the expressions.
    const context = update ? { ...getEvaluationContext(update).context, env } : { env, context: {}, parameters: {} };

    let ids: string[];
    try {
      // A failure fails this group only. Nothing is written and nothing is removed, because a partial
      // view of an account must never turn into a finding.
      const response = await worker.client.resources.postResourceList(resource.type, {
        parameters: evaluateParameters(resource, context),
      });

      ids = response.ids;
    } catch (ex) {
      if (ex instanceof WorkerError && ex.status === NOT_IMPLEMENTED) {
        // Only top level resources such as virtual machines can enumerate an account.
        return NOT_SCANNED;
      }

      throw ex;
    }

    const deployments = await this.getCurrentResourcesByDeployment();
    const graceCutoff = subHours(new Date(runStartedAt), GRACE_PERIOD_HOURS);

    let found = 0;
    for (const resourceUniqueId of ids) {
      if (!isOrphanedResource(resourceUniqueId, deployments, graceCutoff)) {
        continue;
      }

      found++;

      // A resource that was reported before is only refreshed, so that a decision an admin already
      // made about it is kept.
      await this.orphanedResources.upsert(
        {
          lastSeenAt: new Date(runStartedAt),
          resourceDefinitionId,
          resourceType: resource.type,
          resourceUniqueId,
          serviceVersionId,
        },
        { conflictPaths: ['resourceType', 'resourceUniqueId'], skipUpdateIfNoValuesChanged: true },
      );
    }

    // Everything this group reported before but did not see now is gone from the provider, either
    // because an admin removed it by hand or because somebody deleted it directly.
    const { affected } = await this.orphanedResources.delete({
      lastSeenAt: LessThan(new Date(runStartedAt)),
      resourceDefinitionId,
      serviceVersionId,
    });

    const removed = affected || 0;
    if (found > 0 || removed > 0) {
      this.logger.log(`Scanned ${resource.type} of service version ${serviceVersionId}: ${found} orphaned, ${removed} gone.`);
    }

    return { scanned: true, found, removed };
  }

  private async getCurrentResourcesByDeployment() {
    const updates = await this.deploymentUpdates.find({ order: { id: 'DESC' }, relations: ['serviceVersion'] });

    const result = new Map<number, CurrentDeploymentResources>();
    for (const update of updates) {
      // The updates are ordered by ID, therefore the first update per deployment is the newest one.
      if (result.has(update.deploymentId)) {
        continue;
      }

      result.set(update.deploymentId, {
        resourceIds: new Set(update.serviceVersion.definition.resources.map((x) => x.id)),
        updatedAt: update.createdAt,
      });
    }

    return result;
  }
}

export async function scanOrphanGroup(param: ScanOrphanGroupParam): Promise<ScanOrphanGroupResult> {
  return param as any;
}
