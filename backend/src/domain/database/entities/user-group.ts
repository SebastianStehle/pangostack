import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, Repository, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user';

export type UserGroupRepository = Repository<UserGroupEntity>;

@Entity({ name: 'user-groups' })
export class UserGroupEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isBuiltIn: boolean;

  @OneToMany(() => UserEntity, (user) => user.userGroup)
  users: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export const BUILTIN_USER_GROUP_ADMIN = 'admin';
export const BUILTIN_USER_GROUP_DEFAULT = 'default';
