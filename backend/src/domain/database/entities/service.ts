import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { ServiceVersionEntity } from './service-version';

export type ServiceRepository = Repository<ServiceEntity>;

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column('text')
  description: string;

  @Column('simple-json', { default: '{}' })
  environment: Record<string, string> = {};

  @Column({ length: 10, default: 'USD' })
  currency: string = 'USD';

  @Column({ default: 0 })
  pricePerCpuHour: number = 0;

  @Column({ default: 0 })
  pricePerMemoryGbHour: number = 0;

  @Column({ default: 0 })
  pricePerStorageGbHour: number = 0;

  @Column({ default: 0 })
  pricePerDiskGbHour: number = 0;

  @Column({ default: 0 })
  fixedPrice: number = 0;

  @Column({ default: true })
  isPublic: boolean = true;

  @OneToMany(() => ServiceVersionEntity, (version) => version.service)
  versions: ServiceVersionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
