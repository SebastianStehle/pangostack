import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeploymentSubSteps1784721605429 implements MigrationInterface {
  name = 'AddDeploymentSubSteps1784721605429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deployment-update-steps" DROP COLUMN "subSteps"`);
    await queryRunner.query(`ALTER TABLE "deployment-update-steps" ADD "logs" text NOT NULL DEFAULT '[]'`);
    await queryRunner.query(
      `CREATE TABLE "deployment-update-sub-steps" ("id" SERIAL NOT NULL, "stepId" integer NOT NULL, "name" character varying(200) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'Pending', "error" text, "logs" text NOT NULL DEFAULT '[]', "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, CONSTRAINT "PK_836bc93dc693b36466795bd953e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f8def9e8eff8326f0b17783a4d" ON "deployment-update-sub-steps" ("stepId") `);
    await queryRunner.query(`ALTER TABLE "deployment-updates" DROP COLUMN "log"`);
    await queryRunner.query(
      `ALTER TABLE "deployment-update-sub-steps" ADD CONSTRAINT "FK_f8def9e8eff8326f0b17783a4d7" FOREIGN KEY ("stepId") REFERENCES "deployment-update-steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deployment-update-sub-steps" DROP CONSTRAINT "FK_f8def9e8eff8326f0b17783a4d7"`);
    await queryRunner.query(`ALTER TABLE "deployment-updates" ADD "log" text NOT NULL`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f8def9e8eff8326f0b17783a4d"`);
    await queryRunner.query(`DROP TABLE "deployment-update-sub-steps"`);
    await queryRunner.query(`ALTER TABLE "deployment-update-steps" DROP COLUMN "logs"`);
    await queryRunner.query(`ALTER TABLE "deployment-update-steps" ADD "subSteps" text NOT NULL DEFAULT '[]'`);
  }
}
