import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';

export type WorkerRepository = Repository<WorkerEntity>;

@Entity({ name: 'workers' })
export class WorkerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  apiKey?: string;

  @Column({ length: 100 })
  endpoint: string;
}
