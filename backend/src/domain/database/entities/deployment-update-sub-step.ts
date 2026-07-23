import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentStepLog, DeploymentStepStatus, DeploymentUpdateStepEntity } from './deployment-update-step';

export type DeploymentUpdateSubStepRepository = Repository<DeploymentUpdateSubStepEntity>;

// The plain shape exposed to the domain and API, mapped from the entity.
export type DeploymentSubStep = {
  id: number;
  name: string;
  status: DeploymentStepStatus;
  error?: string | null;
  logs: DeploymentStepLog[];
  startedAt?: Date | null;
  completedAt?: Date | null;
};

@Entity({ name: 'deployment-update-sub-steps' })
export class DeploymentUpdateSubStepEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  stepId: number;

  @ManyToOne(() => DeploymentUpdateStepEntity, (step) => step.subSteps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stepId' })
  step: DeploymentUpdateStepEntity;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status: DeploymentStepStatus = 'Pending';

  @Column('text', { nullable: true })
  error?: string | null;

  @Column('simple-json', { default: [] })
  logs: DeploymentStepLog[] = [];

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;
}
