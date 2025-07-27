import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { ServiceVersionEntity } from './service-version';

export type ServiceRepository = Repository<ServiceEntity>;

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('simple-json', { default: '{}' })
  environment: Record<string, string> = {};

  @Column({ length: 10, default: 'USD' })
  currency = 'USD';

  @Column({ default: 0 })
  pricePerCpuHour = 0;

  @Column({ default: 0 })
  pricePerMemoryGbHour = 0;

  @Column({ default: 0 })
  pricePerStorageGbHour = 0;

  @Column({ default: 0 })
  pricePerDiskGbHour = 0;

  @Column({ default: 0 })
  fixedPrice = 0;

  @Column({ default: true })
  isPublic = true;

  @OneToMany(() => ServiceVersionEntity, (version) => version.service)
  versions: ServiceVersionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
