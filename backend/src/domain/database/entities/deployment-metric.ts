import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type DeploymentMetricRepository = Repository<DeploymentMetricEntity>;

@Entity({ name: 'deployment-metrics' })
@Index('IDX_deployment_metrics_lookup', ['deploymentId', 'metricKey', 'createdAt'])
export class DeploymentMetricEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deploymentId: number;

  @ManyToOne(() => DeploymentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column({ length: 100 })
  metricKey: string;

  @Column('simple-json')
  values: Record<string, number> = {};

  @CreateDateColumn()
  createdAt: Date;
}
