import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DeploymentUpdateEntity } from './deployment-update';
import { DeploymentUpdateSubStepEntity } from './deployment-update-sub-step';

export type DeploymentUpdateStepRepository = Repository<DeploymentUpdateStepEntity>;

export type DeploymentStepAction = 'Deploy' | 'Delete';

export type DeploymentStepStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export type DeploymentStepKey = { resourceId: string; action: DeploymentStepAction };

export type DeploymentStepLog = { message: string; timestamp: string };

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

  @Column({ default: 0 })
  attempt: number = 0;

  @OneToMany(() => DeploymentUpdateSubStepEntity, (subStep) => subStep.step)
  subSteps: DeploymentUpdateSubStepEntity[];

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
