import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type BilledDeploymentRepository = Repository<BilledDeploymentEntity>;

@Entity({ name: 'billed-deployment' })
export class BilledDeploymentEntity {
  @Column()
  deploymentId: number;

  @PrimaryColumn('date')
  dateFrom: string;

  @PrimaryColumn('date')
  dateTo: string;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.billed)
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;
}
