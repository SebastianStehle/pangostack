import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';
import { BilledDeploymentEntity } from './billed-deployment';
import { DeploymentLogEntity } from './deployment-log';
import { DeploymentUpdateEntity } from './deployment-update';
import { DeploymentUsageEntity } from './deployment-usage';
import { TeamEntity } from './team';

export type DeploymentRepository = Repository<DeploymentEntity>;

@Entity({ name: 'deployments' })
export class DeploymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: number;

  @ManyToOne(() => TeamEntity, (team) => team.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @OneToMany(() => DeploymentLogEntity, (log) => log.deployment)
  log: DeploymentLogEntity[];

  @OneToMany(() => BilledDeploymentEntity, (billed) => billed.deployment)
  billed: DeploymentUpdateEntity[];

  @OneToMany(() => DeploymentUsageEntity, (usage) => usage.deployment)
  usages: DeploymentUsageEntity[];

  @OneToMany(() => DeploymentUpdateEntity, (update) => update.deployment)
  updates: DeploymentUpdateEntity[];

  @Column({ length: 100, nullable: true })
  name?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  updatedBy: string;
}
