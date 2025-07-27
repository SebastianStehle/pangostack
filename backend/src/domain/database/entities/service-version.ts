import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';
import { DeploymentUpdateEntity } from './deployment-update';
import { ServiceEntity } from './service';

export type ServiceVersionRepository = Repository<ServiceVersionEntity>;

@Entity({ name: 'service-versions' })
export class ServiceVersionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  order: number = 0;

  @Column('text')
  definition: string;

  @Column('simple-json')
  environment: Record<string, string> = {};

  @Column({ default: true })
  isActive: boolean = true;

  @Column()
  serviceId: number;

  @ManyToOne(() => ServiceEntity, (service) => service.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity;

  @OneToMany(() => DeploymentUpdateEntity, (update) => update.serviceVersion)
  deploymentUpdates: DeploymentUpdateEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
