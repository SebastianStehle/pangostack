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
import { DeploymentLogEntity } from './deployment-log';
import { DeploymentUpdateEntity } from './deployment-update';
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

  @OneToMany(() => DeploymentUpdateEntity, (updates) => updates.deployment)
  updates: DeploymentUpdateEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  updatedBy: string;
}
