import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';
import { ServiceVersionEntity } from './service-version';

export type DeploymentUpdateRepository = Repository<DeploymentUpdateEntity>;

@Entity({ name: 'deployment-updates' })
export class DeploymentUpdateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deploymentId: number;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column()
  serviceVersionId: number;

  @ManyToOne(() => ServiceVersionEntity, (version) => version.deploymentUpdates, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'serviceVersionId' })
  serviceVersion: ServiceVersionEntity;

  @Column('simple-json')
  context: Record<string, string> = {};

  @Column('simple-json')
  environment: Record<string, string> = {};

  @Column('simple-json')
  parameters: Record<string, string> = {};

  @Column('simple-json')
  log: Record<string, string> = {};

  @Column()
  status: DeploymentUpdateStatus = 'Pending';

  @Column('text', { nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;
}

export type DeploymentUpdateStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';
