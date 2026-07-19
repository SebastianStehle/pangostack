import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentUpdateEntity } from './deployment-update';

export type DeploymentUpdateStepRepository = Repository<DeploymentUpdateStepEntity>;

export type DeploymentStepAction = 'Deploy' | 'Delete';

export type DeploymentStepStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export type DeploymentSubStepStatus = 'Running' | 'Completed' | 'Failed';

export type DeploymentStepKey = { resourceId: string; action: DeploymentStepAction };

export type DeploymentSubStep = {
  name: string;
  status: DeploymentSubStepStatus;
  message?: string | null;
  startedAt: string;
  completedAt?: string | null;
};

@Entity({ name: 'deployment-update-steps' })
export class DeploymentUpdateStepEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  updateId: number;

  @ManyToOne(() => DeploymentUpdateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'updateId' })
  update: DeploymentUpdateEntity;

  @Column({ length: 100 })
  resourceId: string;

  @Column({ length: 100 })
  resourceName: string;

  @Column({ type: 'varchar', length: 20, default: 'Deploy' })
  action: DeploymentStepAction = 'Deploy';

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status: DeploymentStepStatus = 'Pending';

  @Column({ default: 0 })
  attempt: number = 0;

  @Column('text', { nullable: true })
  error?: string | null;

  @Column('simple-json', { default: [] })
  subSteps: DeploymentSubStep[] = [];

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;
}
