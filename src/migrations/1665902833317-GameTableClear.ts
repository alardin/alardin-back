import { MigrationInterface, QueryRunner } from "typeorm"

export class GameTableClear1665902833317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM games;`
        );
        await queryRunner.query(
            `ALTER TABLE games AUTO_INCREMENT = 1`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
