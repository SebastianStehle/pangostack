import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1760346162798 implements MigrationInterface {
  name = 'Init1760346162798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deployment-checks" ("id" SERIAL NOT NULL, "deploymentId" integer NOT NULL, "status" character varying(10) NOT NULL, "log" character varying(512), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_299df5858124296de2ba2b7c8cc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deployment-logs" ("id" SERIAL NOT NULL, "deploymentId" integer NOT NULL, "textkey" character varying(50) NOT NULL, "parameters" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(50) NOT NULL, CONSTRAINT "PK_1ad194c1de1262c4d7a864b55c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" SERIAL NOT NULL, "name" character varying(100), "description" text NOT NULL, "environment" text NOT NULL DEFAULT '{}', "currency" character varying(10) NOT NULL DEFAULT 'USD', "pricePerCoreHour" numeric(12,4) NOT NULL DEFAULT '0', "pricePerMemoryGBHour" numeric(12,4) NOT NULL DEFAULT '0', "pricePerStorageGBMonth" numeric(12,4) NOT NULL DEFAULT '0', "pricePerVolumeGBHour" numeric(12,4) NOT NULL DEFAULT '0', "fixedPrice" numeric(12,4) NOT NULL DEFAULT '0', "fixedPriceDescription" character varying(100), "isPublic" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service-versions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "definition" text NOT NULL, "environment" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "serviceId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dc0f7a9c856ab50894f7705796d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deployment-updates" ("id" SERIAL NOT NULL, "deploymentId" integer NOT NULL, "serviceVersionId" integer NOT NULL, "resourceConnections" text NOT NULL DEFAULT '{}', "resourceContexts" text NOT NULL DEFAULT '{}', "context" text NOT NULL, "environment" text NOT NULL, "parameters" text NOT NULL, "log" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'Pending', "error" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(50) NOT NULL, CONSTRAINT "PK_c96c319967595efe690222cc243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deployment-usage" ("deploymentId" integer NOT NULL, "trackDate" date NOT NULL, "trackHour" integer NOT NULL, "totalCores" integer NOT NULL, "totalMemoryGB" integer NOT NULL, "totalVolumeGB" integer NOT NULL, "totalStorageGB" integer NOT NULL, "additionalPrices" text NOT NULL DEFAULT '{}', CONSTRAINT "PK_5747480727d23d54b9fbff45ab1" PRIMARY KEY ("deploymentId", "trackDate", "trackHour"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user-groups" ("id" character varying NOT NULL, "name" character varying(100) NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isBuiltIn" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_31bcff63bb07edf1833e1eed859" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "apiKey" character varying(100), "passwordHash" character varying, "roles" text, "userGroupId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team-users" ("userId" character varying(50) NOT NULL, "teamId" integer NOT NULL, "role" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91f183d04c66077026e70948e64" PRIMARY KEY ("userId", "teamId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deployments" ("id" SERIAL NOT NULL, "teamId" integer NOT NULL, "serviceId" integer NOT NULL, "name" character varying(100), "status" character varying(100) NOT NULL DEFAULT 'Created', "confirmToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(50) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(50) NOT NULL, CONSTRAINT "PK_1e5627acb3c950deb83fe98fc48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billed-deployment" ("deploymentId" integer NOT NULL, "dateFrom" date NOT NULL, "dateTo" date NOT NULL, CONSTRAINT "PK_e72efc915ea19520ac34a4b1a39" PRIMARY KEY ("dateFrom", "dateTo"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blobs" ("id" character varying NOT NULL, "type" character varying(50) NOT NULL, "buffer" text NOT NULL, CONSTRAINT "PK_fe61649fa345f685eb31b949e4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cache" ("key" character varying NOT NULL, "value" text NOT NULL, "expires" TIMESTAMP NOT NULL, CONSTRAINT "PK_56570efc222b6e6be947abfc801" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" character varying NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" SERIAL NOT NULL, "name" character varying(30), "primaryColor" character varying(20), "primaryContentColor" character varying(20), "headerColor" character varying(20), "welcomeText" text, "customCss" text, "headerLinks" text, "footerLinks" text, "footerText" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workers" ("id" SERIAL NOT NULL, "apiKey" character varying(100), "endpoint" character varying(100) NOT NULL, CONSTRAINT "PK_e950c9aba3bd84a4f193058d838" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-checks" ADD CONSTRAINT "FK_7b8bfd1ed08a56b6a773a2d2929" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-logs" ADD CONSTRAINT "FK_0fd96c51ed8608b25cbd3bb7934" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service-versions" ADD CONSTRAINT "FK_e3edf37afd64bc4af7e3be9cfb2" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-updates" ADD CONSTRAINT "FK_201c0d8b62f95eabb648272ce3f" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-updates" ADD CONSTRAINT "FK_976533424d0ece2a55f69ccd60d" FOREIGN KEY ("serviceVersionId") REFERENCES "service-versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployment-usage" ADD CONSTRAINT "FK_1322d253ba0f6f6fbfa8bbfa8d7" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_8b96e0ec79394c7e66bf88a05aa" FOREIGN KEY ("userGroupId") REFERENCES "user-groups"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team-users" ADD CONSTRAINT "FK_136d3ce0c6f04dd11378859f71f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team-users" ADD CONSTRAINT "FK_93f445ec59654e2afe33e049d81" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployments" ADD CONSTRAINT "FK_4ca10e2bd9294042361ad332de8" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deployments" ADD CONSTRAINT "FK_f083ccb82822f2b3f81bbc891b6" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billed-deployment" ADD CONSTRAINT "FK_bac7d335cc36a5c589985db312a" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billed-deployment" DROP CONSTRAINT "FK_bac7d335cc36a5c589985db312a"`);
    await queryRunner.query(`ALTER TABLE "deployments" DROP CONSTRAINT "FK_f083ccb82822f2b3f81bbc891b6"`);
    await queryRunner.query(`ALTER TABLE "deployments" DROP CONSTRAINT "FK_4ca10e2bd9294042361ad332de8"`);
    await queryRunner.query(`ALTER TABLE "team-users" DROP CONSTRAINT "FK_93f445ec59654e2afe33e049d81"`);
    await queryRunner.query(`ALTER TABLE "team-users" DROP CONSTRAINT "FK_136d3ce0c6f04dd11378859f71f"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8b96e0ec79394c7e66bf88a05aa"`);
    await queryRunner.query(`ALTER TABLE "deployment-usage" DROP CONSTRAINT "FK_1322d253ba0f6f6fbfa8bbfa8d7"`);
    await queryRunner.query(`ALTER TABLE "deployment-updates" DROP CONSTRAINT "FK_976533424d0ece2a55f69ccd60d"`);
    await queryRunner.query(`ALTER TABLE "deployment-updates" DROP CONSTRAINT "FK_201c0d8b62f95eabb648272ce3f"`);
    await queryRunner.query(`ALTER TABLE "service-versions" DROP CONSTRAINT "FK_e3edf37afd64bc4af7e3be9cfb2"`);
    await queryRunner.query(`ALTER TABLE "deployment-logs" DROP CONSTRAINT "FK_0fd96c51ed8608b25cbd3bb7934"`);
    await queryRunner.query(`ALTER TABLE "deployment-checks" DROP CONSTRAINT "FK_7b8bfd1ed08a56b6a773a2d2929"`);
    await queryRunner.query(`DROP TABLE "workers"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "cache"`);
    await queryRunner.query(`DROP TABLE "blobs"`);
    await queryRunner.query(`DROP TABLE "billed-deployment"`);
    await queryRunner.query(`DROP TABLE "deployments"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "team-users"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user-groups"`);
    await queryRunner.query(`DROP TABLE "deployment-usage"`);
    await queryRunner.query(`DROP TABLE "deployment-updates"`);
    await queryRunner.query(`DROP TABLE "service-versions"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "deployment-logs"`);
    await queryRunner.query(`DROP TABLE "deployment-checks"`);
  }
}
