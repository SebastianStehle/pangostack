import { InjectRepository } from '@nestjs/typeorm';
import { ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type GetOrphanScanGroupsParam = Record<string, never>;

export type GetOrphanScanGroupsResult = { serviceVersionId: number; resourceDefinitionId: string }[];

@Activity(getOrphanScanGroups)
export class GetOrphanScanGroupsActivity implements Activity<GetOrphanScanGroupsParam, GetOrphanScanGroupsResult> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute() {
    // Deployments sharing a service version and resource share a group, so an account is scanned once.
    const versions = await this.serviceVersions.find();

    // Only the keys leave the activity, so that credentials never end up in the Temporal history.
    const result: GetOrphanScanGroupsResult = [];
    for (const version of versions) {
      for (const resource of version.definition.resources) {
        result.push({ serviceVersionId: version.id, resourceDefinitionId: resource.id });
      }
    }

    return result;
  }
}

export async function getOrphanScanGroups(param: GetOrphanScanGroupsParam): Promise<GetOrphanScanGroupsResult> {
  return param as any;
}
