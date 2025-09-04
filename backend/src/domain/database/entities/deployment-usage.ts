import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type DeploymentUsageRepository = Repository<DeploymentUsageEntity>;

@Entity({ name: 'deployment-usage' })
export class DeploymentUsageEntity {
  @PrimaryColumn()
  deploymentId: number;

  @PrimaryColumn('date')
  trackDate: string;

  @PrimaryColumn()
  trackHour: number;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column()
  totalCores: number;

  @Column()
  totalMemoryGB: number;

  @Column()
  totalVolumeGB: number;

  @Column()
  totalStorageGB: number;

  @Column('simple-json', { default: '{}' })
  additionalPrices: Record<string, { quantity: number }> = {};
}
