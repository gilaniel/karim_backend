import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1771567477687 implements MigrationInterface {
    name = 'Initial1771567477687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."activities_type_enum" AS ENUM('SLEEP', 'AWAKE', 'FALLING_ASLEEP', 'FEEDING')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."activities_type_enum" NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP, "volumeMl" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_704a5fe2080d400189b76938cd" ON "activities" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2c07e1505a6a5645289060215" ON "activities" ("startTime") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c2c07e1505a6a5645289060215"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_704a5fe2080d400189b76938cd"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_type_enum"`);
    }

}
