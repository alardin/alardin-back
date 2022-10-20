import { MigrationInterface, QueryRunner } from "typeorm"

export class DeleteTables1666279309403 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE game_used_images DROP FOREIGN KEY FK_ea24c8afa538981f66a84119dcd;`
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS game_play_images, game_play_keywords, game_used_images`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
