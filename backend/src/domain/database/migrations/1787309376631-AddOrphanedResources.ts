import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrphanedResources1787309376631 implements MigrationInterface {
  name = 'AddOrphanedResources1787309376631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orphaned-resources" ("id" SERIAL NOT NULL, "resourceUniqueId" character varying(255) NOT NULL, "resourceType" character varying(100) NOT NULL, "serviceVersionId" integer NOT NULL, "resourceDefinitionId" character varying(100) NOT NULL, "detectedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastSeenAt" TIMESTAMP NOT NULL, "status" character varying(20) NOT NULL, "resolvedAt" TIMESTAMP, CONSTRAINT "UQ_orphaned_resources_resource" UNIQUE ("resourceType", "resourceUniqueId"), CONSTRAINT "PK_2cc78045e4d20d76523f12d1832" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_orphaned_resources_lookup" ON "orphaned-resources" ("status", "lastSeenAt") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_orphaned_resources_lookup"`);
    await queryRunner.query(`DROP TABLE "orphaned-resources"`);
  }
}
