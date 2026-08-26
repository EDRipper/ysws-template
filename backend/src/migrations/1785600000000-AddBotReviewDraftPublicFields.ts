import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBotReviewDraftPublicFields1785600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bot_review_drafts"
      ADD COLUMN "public_checklist" text,
      ADD COLUMN "public_summary" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bot_review_drafts"
      DROP COLUMN "public_checklist",
      DROP COLUMN "public_summary"
    `);
  }
}
