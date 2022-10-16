import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsPrivateColumnToUsers1665905689147 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN is_private boolean DEFAULT false`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
