import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';

export type WorkerRepository = Repository<WorkerEntity>;

@Entity({ name: 'workers' })
export class WorkerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apiKey: string;

  @Column()
  endpoint: string;
}
