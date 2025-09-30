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
import { ServiceDefinition } from 'src/domain/definitions';
import { DeploymentUpdateEntity } from './deployment-update';
import { ServiceEntity } from './service';

export type ServiceVersionRepository = Repository<ServiceVersionEntity>;

@Entity({ name: 'service-versions' })
export class ServiceVersionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-json')
  definition: ServiceDefinition;

  @Column('simple-json')
  environment: Record<string, string> = {};

  @Column({ default: true })
  isActive: boolean = true;

  @Column()
  serviceId: number;

  @ManyToOne(() => ServiceEntity, (service) => service.versions, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity;

  @OneToMany(() => DeploymentUpdateEntity, (update) => update.serviceVersion)
  deploymentUpdates: DeploymentUpdateEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
