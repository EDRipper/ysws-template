import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBotReviewDrafts1785500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bot_review_drafts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL UNIQUE REFERENCES "projects"("id") ON DELETE CASCADE,
        "submission_id" uuid,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "verdict" varchar(20),
        "hours_estimate" real,
        "justification" text,
        "signals_fired" text,
        "dispatched_at" timestamptz,
        "responded_at" timestamptz,
        "dismissed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bot_review_drafts_status" ON "bot_review_drafts" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bot_review_drafts"`);
  }
}
