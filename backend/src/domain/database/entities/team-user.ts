import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Repository } from 'typeorm';
import { TeamEntity } from './team';
import { UserEntity } from './user';
import { UserGroupEntity } from './user-group';

export type TeamUserRepository = Repository<TeamUserEntity>;

@Entity({ name: 'team-users' })
export class TeamUserEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  teamId: number;

  @Column({ length: 100 })
  role: string;

  @ManyToOne(() => UserGroupEntity, (userGroup) => userGroup.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => UserGroupEntity, (userGroup) => userGroup.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;
}
