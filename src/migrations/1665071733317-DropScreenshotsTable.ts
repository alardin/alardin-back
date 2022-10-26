import { MigrationInterface, QueryRunner } from "typeorm"

export class DropScreenshotsTable1665071733317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP TABLE games_screenshots`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
