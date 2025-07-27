import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';

export type SessionRepository = Repository<SessionEntity>;

@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryColumn()
  id: string;

  @Column('simple-json')
  value: any;
}
