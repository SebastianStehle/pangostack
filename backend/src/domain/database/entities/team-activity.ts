import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { TeamEntity } from './team';

export type TeamActivityRepository = Repository<TeamActivityEntity>;

@Entity({ name: 'team-activities' })
@Index('IDX_team_activities_lookup', ['teamId', 'createdAt'])
@Index('IDX_team_activities_deployment', ['teamId', 'deploymentId'])
export class TeamActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: number;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @Column({ length: 100 })
  key: string;

  @Column('simple-json')
  parameters: Record<string, unknown> = {};

  @Column({ type: 'int', nullable: true })
  deploymentId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy?: string | null;
}
