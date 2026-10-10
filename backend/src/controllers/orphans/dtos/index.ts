import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { OrphanedResourceStatus } from 'src/domain/database';
import { OrphanedResource } from 'src/domain/orphans';

export const ORPHANED_RESOURCE_STATUS: OrphanedResourceStatus[] = ['Open', 'Ignored', 'Deleted'];

export class OrphanedResourceDto {
  @ApiProperty({
    description: 'The ID of the finding.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The unique ID the resource was provisioned with.',
    required: true,
  })
  resourceUniqueId: string;

  @ApiProperty({
    description: 'The type of the resource.',
    required: true,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The service version whose credentials found the resource.',
    required: true,
  })
  serviceVersionId: number;

  @ApiProperty({
    description: 'The ID of the resource within the definition.',
    required: true,
  })
  resourceDefinitionId: string;

  @ApiProperty({
    description: 'The date time when the resource was reported for the first time.',
    required: true,
  })
  detectedAt: Date;

  @ApiProperty({
    description: 'The date time when the resource was last seen at the provider.',
    required: true,
  })
  lastSeenAt: Date;

  @ApiProperty({
    description: 'The status of the finding.',
    required: true,
    enum: ORPHANED_RESOURCE_STATUS,
  })
  status: OrphanedResourceStatus;

  @ApiProperty({
    description: 'The date time when an admin resolved the finding.',
    nullable: true,
    type: Date,
  })
  resolvedAt: Date | null;

  static fromDomain(source: OrphanedResource) {
    return Object.assign(new OrphanedResourceDto(), source);
  }
}

export class OrphanedResourcesDto {
  @ApiProperty({
    description: 'The orphaned resources.',
    required: true,
    type: [OrphanedResourceDto],
  })
  items: OrphanedResourceDto[];

  @ApiProperty({
    description: 'The total number of orphaned resources.',
    required: true,
  })
  total: number;

  static fromDomain(source: OrphanedResource[], total: number) {
    const result = new OrphanedResourcesDto();
    result.items = source.map(OrphanedResourceDto.fromDomain);
    result.total = total;
    return result;
  }
}

export class SetOrphanedResourceStatusDto {
  @ApiProperty({
    description: 'The status to assign to the finding.',
    required: true,
    enum: ORPHANED_RESOURCE_STATUS,
  })
  @IsDefined()
  @IsEnum(ORPHANED_RESOURCE_STATUS)
  status: OrphanedResourceStatus;
}
