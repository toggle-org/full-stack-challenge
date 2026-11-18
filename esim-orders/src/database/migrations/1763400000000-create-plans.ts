import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlans1763400000000 implements MigrationInterface {
  name = 'CreatePlans1763400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" character varying(32) NOT NULL, "name" character varying(64) NOT NULL, "data_gb" integer NOT NULL, "validity_days" integer NOT NULL, "price_cents" integer NOT NULL, "currency" character varying(3) NOT NULL, CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "plans" ("id", "name", "data_gb", "validity_days", "price_cents", "currency") VALUES
        ('eu-5gb', 'Europe 5 GB', 5, 30, 1199, 'USD'),
        ('us-10gb', 'USA 10 GB', 10, 30, 1999, 'USD'),
        ('global-3gb', 'Global 3 GB', 3, 15, 1499, 'USD')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "plans"`);
  }
}
