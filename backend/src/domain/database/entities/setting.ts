import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';

export type SettingRepository = Repository<SettingEntity>;
export type SettingLink = { title: string; url: string };

@Entity({ name: 'settings' })
export class SettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30, nullable: true })
  name?: string;

  @Column('varchar', { length: 20, nullable: true })
  primaryColor?: string | null;

  @Column('varchar', { length: 20, nullable: true })
  primaryContentColor?: string | null;

  @Column('varchar', { length: 20, nullable: true })
  headerColor?: string | null;

  @Column('text', { nullable: true })
  welcomeText?: string | null;

  @Column('text', { nullable: true })
  customCss?: string | null;

  @Column('simple-json', { nullable: true })
  headerLinks?: SettingLink[] | null;

  @Column('simple-json', { nullable: true })
  footerLinks?: SettingLink[] | null;

  @Column('text', { nullable: true })
  footerText?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
