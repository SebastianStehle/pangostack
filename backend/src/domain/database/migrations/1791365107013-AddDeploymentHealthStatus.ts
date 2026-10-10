import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeploymentHealthStatus1791365107013 implements MigrationInterface {
  name = 'AddDeploymentHealthStatus1791365107013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deployments" ADD "healthStatus" character varying(10)`);
    await queryRunner.query(`ALTER TABLE "deployments" ADD "notifiedHealthStatus" character varying(10)`);
    await queryRunner.query(`ALTER TABLE "deployments" ADD "healthNotifiedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deployments" DROP COLUMN "healthNotifiedAt"`);
    await queryRunner.query(`ALTER TABLE "deployments" DROP COLUMN "notifiedHealthStatus"`);
    await queryRunner.query(`ALTER TABLE "deployments" DROP COLUMN "healthStatus"`);
  }
}
