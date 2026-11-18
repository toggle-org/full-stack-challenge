import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1763400100000 implements MigrationInterface {
  name = 'CreateOrders1763400100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_id" character varying(32) NOT NULL, "email" character varying(320) NOT NULL, "amount_cents" integer NOT NULL, "currency" character varying(3) NOT NULL, "status" character varying(32) NOT NULL DEFAULT 'pending_payment', "payment_intent_id" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5e2c3c743962a9fad107e4e60d" ON "orders" ("payment_intent_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "esims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "iccid" character varying(22) NOT NULL, "activation_code" character varying(128) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6abff6bf65ece97755eaf0d9d06" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "esims" ADD CONSTRAINT "FK_e94a0dc73e88c2003c87adb6b92" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "esims" DROP CONSTRAINT "FK_e94a0dc73e88c2003c87adb6b92"`,
    );
    await queryRunner.query(`DROP TABLE "esims"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e2c3c743962a9fad107e4e60d"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
