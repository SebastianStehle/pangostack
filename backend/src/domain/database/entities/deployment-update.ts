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

  @ManyToOne(() => ServiceVersionEntity, (version) => version.deploymentUpdates, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'serviceVersionId' })
  serviceVersion: ServiceVersionEntity;

  @Column('simple-json', { default: {} })
  resourceConnections: Record<string, Record<string, ConnectionInfo>> = {};

  @Column('simple-json', { default: {} })
  resourceContexts: Record<string, Record<string, string>> = {};

  @Column('simple-json')
  context: Record<string, Record<string, string>> = {};

  @Column('simple-json')
  environment: Record<string, string> = {};

  @Column('simple-json')
  parameters: Record<string, string> = {};

  @Column('simple-json')
  log: Record<string, string> = {};

  @Column({ length: 20, default: 'Pending' })
  status: DeploymentUpdateStatus = 'Pending';

  @Column('text', { nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 50 })
  createdBy: string;
}

export type ConnectionInfo = { value: string; isPublic: boolean; label: string };

export type DeploymentUpdateStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';
