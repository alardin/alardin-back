import { MigrationInterface, QueryRunner } from "typeorm"

export class DeleteForeinKey1666314135662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP FOREIGN KEY FK_f9a2f98191dd95f8693c77de156;`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
