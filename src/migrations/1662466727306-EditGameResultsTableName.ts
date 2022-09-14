import { MigrationInterface, QueryRunner } from "typeorm"

export class EditGameResultsTableName1662466727306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE game_results RENAME alarm_results'
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE alarm_results RENAME game_results'
        )
    }

}
