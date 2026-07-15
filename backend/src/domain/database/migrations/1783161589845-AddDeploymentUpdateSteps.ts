import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeploymentUpdateSteps1783161589845 implements MigrationInterface {
    name = 'AddDeploymentUpdateSteps1783161589845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "deployment-update-steps" ("id" SERIAL NOT NULL, "updateId" integer NOT NULL, "resourceId" character varying(100) NOT NULL, "resourceName" character varying(100) NOT NULL, "action" character varying(20) NOT NULL DEFAULT 'Deploy', "status" character varying(20) NOT NULL DEFAULT 'Pending', "attempt" integer NOT NULL DEFAULT '0', "error" text, "subSteps" text NOT NULL DEFAULT '[]', "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, CONSTRAINT "PK_eea1dc359eba49eac2c8bc84202" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e5f889a4e3301f1790914fc3f4" ON "deployment-update-steps" ("updateId") `);
        await queryRunner.query(`ALTER TABLE "deployment-update-steps" ADD CONSTRAINT "FK_e5f889a4e3301f1790914fc3f40" FOREIGN KEY ("updateId") REFERENCES "deployment-updates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deployment-update-steps" DROP CONSTRAINT "FK_e5f889a4e3301f1790914fc3f40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5f889a4e3301f1790914fc3f4"`);
        await queryRunner.query(`DROP TABLE "deployment-update-steps"`);
    }

}
