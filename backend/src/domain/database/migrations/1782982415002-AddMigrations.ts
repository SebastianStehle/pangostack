import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMigrations1782982415002 implements MigrationInterface {
  name = 'AddMigrations1782982415002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deployment-metrics" ("id" SERIAL NOT NULL, "deploymentId" integer NOT NULL, "metricKey" character varying(100) NOT NULL, "values" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8899686f4dc138f15ede9abedba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deployment_metrics_lookup" ON "deployment-metrics" ("deploymentId", "metricKey", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-metrics" ADD CONSTRAINT "FK_55a959ee8d10c7700ddcb610884" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deployment-metrics" DROP CONSTRAINT "FK_55a959ee8d10c7700ddcb610884"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_deployment_metrics_lookup"`);
    await queryRunner.query(`DROP TABLE "deployment-metrics"`);
  }
}
