import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { ChatSuggestion } from 'src/domain/shared';

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

  @Column('text', { nullable: true })
  agentName?: string;

  @Column('text', { nullable: true })
  chatFooter?: string;

  @Column('json', { nullable: true })
  chatSuggestions?: ChatSuggestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
