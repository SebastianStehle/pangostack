import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';

export type BlobRepository = Repository<BlobEntity>;

@Entity({ name: 'blobs' })
export class BlobEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column('text')
  buffer: string;
}
