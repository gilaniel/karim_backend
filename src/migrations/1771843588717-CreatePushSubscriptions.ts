import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePushSubscriptions1771843588717 implements MigrationInterface {
    name = 'CreatePushSubscriptions1771843588717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "subscription" jsonb NOT NULL, "deviceInfo" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastNotifiedAt" TIMESTAMP, CONSTRAINT "PK_757fc8f00c34f66832668dc2e53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4cc061875e9eecc311a94b3e43" ON "push_subscriptions" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4cc061875e9eecc311a94b3e43"`);
        await queryRunner.query(`DROP TABLE "push_subscriptions"`);
    }

}
