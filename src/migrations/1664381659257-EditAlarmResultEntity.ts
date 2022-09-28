import { MigrationInterface, QueryRunner } from "typeorm"

export class EditAlarmResultEntity1664381659257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE alarm_results
                DROP COLUMN trial,
                DROP COLUMN is_bot_used,
                DROP COLUMN play_time;`
        );
        await queryRunner.query(
            `ALTER TABLE alarm_results ADD data JSON`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
