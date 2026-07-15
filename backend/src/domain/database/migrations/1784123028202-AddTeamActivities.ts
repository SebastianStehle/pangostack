import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamActivities1784123028202 implements MigrationInterface {
  name = 'AddTeamActivities1784123028202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team-activities" ("id" SERIAL NOT NULL, "teamId" integer NOT NULL, "key" character varying(100) NOT NULL, "parameters" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(50), CONSTRAINT "PK_fe16e9df1b23b75d7de1a1ad062" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_team_activities_lookup" ON "team-activities" ("teamId", "createdAt") `);
    await queryRunner.query(
      `ALTER TABLE "team-activities" ADD CONSTRAINT "FK_b0c374561f70777ac23ace037e9" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team-activities" DROP CONSTRAINT "FK_b0c374561f70777ac23ace037e9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_team_activities_lookup"`);
    await queryRunner.query(`DROP TABLE "team-activities"`);
  }
}
