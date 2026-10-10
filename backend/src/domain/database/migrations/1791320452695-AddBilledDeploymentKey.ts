import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBilledDeploymentKey1791320452695 implements MigrationInterface {
  name = 'AddBilledDeploymentKey1791320452695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billed-deployment" DROP CONSTRAINT "PK_e72efc915ea19520ac34a4b1a39"`);
    await queryRunner.query(
      `ALTER TABLE "billed-deployment" ADD CONSTRAINT "PK_15872f9e8f8001622cdccc8a3a2" PRIMARY KEY ("deploymentId", "dateFrom", "dateTo")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billed-deployment" DROP CONSTRAINT "PK_15872f9e8f8001622cdccc8a3a2"`);
    await queryRunner.query(
      `ALTER TABLE "billed-deployment" ADD CONSTRAINT "PK_e72efc915ea19520ac34a4b1a39" PRIMARY KEY ("dateFrom", "dateTo")`,
    );
  }
}
