import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { ServiceVersionEntity } from './service-version';

export type ServiceRepository = Repository<ServiceEntity>;

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-json')
  environment: Record<string, string> = {};

  @Column()
  currency: string;

  @Column()
  pricePerCpuHour: number;

  @Column()
  pricePerMemoryGbHour: number;

  @Column()
  pricePerStorageGbHour: number;

  @Column()
  pricePerDiskGbHour: number;

  @Column()
  fixedPrice: number;

  @Column()
  isPublic: boolean;

  @OneToMany(() => ServiceVersionEntity, (version) => version.service)
  versions: ServiceVersionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
