import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAppleColumns1665549540266 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN apple_id VARCHAR(100) NOT NULL, 
                               ADD COLUMN apple_email VARCHAR(256) NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
