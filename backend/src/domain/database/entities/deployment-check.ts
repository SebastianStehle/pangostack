import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type DeploymentCheckRepository = Repository<DeploymentCheckEntity>;

@Entity({ name: 'deployment-checks' })
export class DeploymentCheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deploymentId: number;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column({ length: 10 })
  status: DeploymentCheckStatus = 'Failed';

  @Column({ length: 512, nullable: true })
  log: string;

  @CreateDateColumn()
  createdAt: Date;
}

export type DeploymentCheckStatus = 'Succeeded' | 'Failed';
