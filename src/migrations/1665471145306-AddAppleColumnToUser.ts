import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAppleColumnToUser1665471145306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN apple_id VARCHAR(100), apple_email VARCHAR(254)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP apple_id, DROP apple_email`
        );
    }

}
