import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { DeploymentEntity } from './deployment';
import { TeamUserEntity } from './team-user';

export type TeamRepository = Repository<TeamEntity>;

@Entity({ name: 'teams' })
export class TeamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => TeamUserEntity, (user) => user.team)
  users: TeamUserEntity[];

  @OneToMany(() => DeploymentEntity, (deployment) => deployment.team)
  deployments: DeploymentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
