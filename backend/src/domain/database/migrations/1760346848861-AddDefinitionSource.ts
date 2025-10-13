import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefinitionSource1760346848861 implements MigrationInterface {
  name = 'AddDefinitionSource1760346848861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service-versions" ADD "definitionSource" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service-versions" DROP COLUMN "definitionSource"`);
  }
}
