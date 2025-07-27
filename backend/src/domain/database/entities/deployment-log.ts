import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentEntity } from './deployment';

export type DeploymentLogRepository = Repository<DeploymentLogEntity>;

@Entity({ name: 'deployment-logs' })
export class DeploymentLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deploymentId: number;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.log, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column()
  textkey: string;

  @Column('text')
  parameters: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: number;
}
