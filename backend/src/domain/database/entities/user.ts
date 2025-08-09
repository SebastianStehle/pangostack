import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';
import { TeamUserEntity } from './team-user';
import { UserGroupEntity } from './user-group';

export type UserRepository = Repository<UserEntity>;

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column('varchar', { length: 100, nullable: true })
  apiKey?: string | null;

  @Column('varchar', { nullable: true })
  passwordHash?: string | null;

  @Column('simple-json', { nullable: true })
  roles?: string[] | null;

  @Column({ nullable: true })
  userGroupId: string;

  @ManyToOne(() => UserGroupEntity, (userGroup) => userGroup.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userGroupId' })
  userGroup: UserGroupEntity;

  @OneToMany(() => TeamUserEntity, (userTeam) => userTeam.user)
  userTeams: TeamUserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
