import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { OrphanedResourceEntity, OrphanedResourceRepository, OrphanedResourceStatus } from 'src/domain/database';
import { OrphanedResource } from '../interfaces';
import { buildOrphanedResource } from './utils';

export class SetOrphanedResourceStatus extends Command<SetOrphanedResourceStatusResult> {
  constructor(
    public readonly orphanedResourceId: number,
    public readonly status: OrphanedResourceStatus,
  ) {
    super();
  }
}

export class SetOrphanedResourceStatusResult {
  constructor(public readonly orphanedResource: OrphanedResource) {}
}

@CommandHandler(SetOrphanedResourceStatus)
export class SetOrphanedResourceStatusHandler
  implements ICommandHandler<SetOrphanedResourceStatus, SetOrphanedResourceStatusResult>
{
  constructor(
    @InjectRepository(OrphanedResourceEntity)
    private readonly orphanedResources: OrphanedResourceRepository,
  ) {}

  async execute(request: SetOrphanedResourceStatus): Promise<SetOrphanedResourceStatusResult> {
    const { orphanedResourceId, status } = request;

    const orphanedResource = await this.orphanedResources.findOneBy({ id: orphanedResourceId });
    if (!orphanedResource) {
      throw new NotFoundException(`Orphaned resource ${orphanedResourceId} not found.`);
    }

    // Only the decision is recorded, removing the resource itself stays a manual task.
    orphanedResource.status = status;
    orphanedResource.resolvedAt = status === 'Open' ? null : new Date();
    await this.orphanedResources.save(orphanedResource);

    return new SetOrphanedResourceStatusResult(buildOrphanedResource(orphanedResource));
  }
}
