import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { DecimalToNumberTransformer } from 'src/lib';
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

  @Column('decimal', {
    default: 0,
    precision: 12,
    scale: 4,
    transformer: DecimalToNumberTransformer,
  })
  pricePerCoreHour: number = 0;

  @Column('decimal', {
    default: 0,
    precision: 12,
    scale: 4,
    transformer: DecimalToNumberTransformer,
  })
  pricePerMemoryGBHour: number = 0;

  @Column('decimal', {
    default: 0,
    precision: 12,
    scale: 4,
    transformer: DecimalToNumberTransformer,
  })
  pricePerStorageGBMonth: number = 0;

  @Column('decimal', {
    default: 0,
    precision: 12,
    scale: 4,
    transformer: DecimalToNumberTransformer,
  })
  pricePerVolumeGBHour: number = 0;

  @Column('decimal', {
    default: 0,
    precision: 12,
    scale: 4,
    transformer: DecimalToNumberTransformer,
  })
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
