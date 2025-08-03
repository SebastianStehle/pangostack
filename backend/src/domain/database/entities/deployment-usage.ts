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

  @Column()
  trackDate: Date;

  @Column()
  trackHour: number;

  @Column()
  totalCpus: number;

  @Column()
  totalMemoryGb: number;

  @Column()
  totalVolumeGb: number;

  @Column()
  totalStorage: number;
}
