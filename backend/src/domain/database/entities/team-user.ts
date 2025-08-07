import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Repository } from 'typeorm';
import { TeamEntity } from './team';
import { UserEntity } from './user';

export type TeamUserRepository = Repository<TeamUserEntity>;

@Entity({ name: 'team-users' })
export class TeamUserEntity {
  @PrimaryColumn({ length: 50 })
  userId: string;

  @PrimaryColumn()
  teamId: number;

  @Column({ length: 100 })
  role: string;

  @ManyToOne(() => UserEntity, (user) => user.userTeams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => TeamEntity, (team) => team.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;
}
