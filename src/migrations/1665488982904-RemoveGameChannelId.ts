import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveGameChannelId1665488982904 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE alarm_results DROP FOREIGN KEY FK_8e30edd9c346d13f3a2efe2fd34`,
    );
    await queryRunner.query(
      `ALTER TABLE alarm_results DROP COLUMN Game_channel_id;gi`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
