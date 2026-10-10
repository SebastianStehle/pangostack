import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Repository, Unique } from 'typeorm';

export type OrphanedResourceRepository = Repository<OrphanedResourceEntity>;

@Entity({ name: 'orphaned-resources' })
@Unique('UQ_orphaned_resources_resource', ['resourceType', 'resourceUniqueId'])
@Index('IDX_orphaned_resources_lookup', ['status', 'lastSeenAt'])
export class OrphanedResourceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  resourceUniqueId: string;

  @Column({ length: 100 })
  resourceType: string;

  @Column()
  serviceVersionId: number;

  @Column({ length: 100 })
  resourceDefinitionId: string;

  @CreateDateColumn()
  detectedAt: Date;

  @Column()
  lastSeenAt: Date;

  @Column({ type: 'varchar', length: 20 })
  status: OrphanedResourceStatus = 'Open';

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;
}

export type OrphanedResourceStatus = 'Open' | 'Ignored' | 'Deleted';
