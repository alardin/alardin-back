import { MigrationInterface, QueryRunner } from "typeorm"

export class ClearGames1666769955920 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM alarms`
        );
        await queryRunner.query(
            `DELETE FROM alarm_play_records`
        );
        await queryRunner.query(
            `DELETE FROM alarm_results`
        );
        await queryRunner.query(
            `DELETE FROM games`
        );
        await queryRunner.query(
            `ALTER TABLE games AUTO_INCREMENT = 1`
        );
        await queryRunner.query(
            `ALTER TABLE alarms AUTO_INCREMENT = 1`
        );
        await queryRunner.query(
            `ALTER TABLE alarm_results AUTO_INCREMENT = 1`
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
