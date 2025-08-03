import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type DeploymentUsageRepository = Repository<DeploymentUsageEntity>;

@Entity({ name: 'deployment-usage' })
export class DeploymentUsageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deploymentId: number;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column('date')
  trackDate: string;

  @Column()
  trackHour: number;

  @Column()
  totalCores: number;

  @Column()
  totalMemoryGB: number;

  @Column()
  totalVolumeGB: number;

  @Column()
  totalStorageGB: number;
}
