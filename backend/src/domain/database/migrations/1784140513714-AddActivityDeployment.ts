import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityDeployment1784140513714 implements MigrationInterface {
  name = 'AddActivityDeployment1784140513714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team-activities" ADD "deploymentId" integer`);
    await queryRunner.query(`CREATE INDEX "IDX_team_activities_deployment" ON "team-activities" ("teamId", "deploymentId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_team_activities_deployment"`);
    await queryRunner.query(`ALTER TABLE "team-activities" DROP COLUMN "deploymentId"`);
  }
}
