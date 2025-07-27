import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';

export type SettingRepository = Repository<SettingEntity>;

@Entity({ name: 'settings' })
export class SettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, nullable: true })
  name?: string;

  @Column({ length: 20, nullable: true })
  primaryColor?: string;

  @Column({ length: 20, nullable: true })
  primaryContentColor?: string;

  @Column('text', { nullable: true })
  welcomeText?: string;

  @Column('text', { nullable: true })
  customCss?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
