import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';

export type CacheRepository = Repository<CacheEntity>;

@Entity({ name: 'cache' })
export class CacheEntity {
  @PrimaryColumn()
  key: string;

  @Column('simple-json')
  value: string;

  @Column()
  expires: Date;
}
