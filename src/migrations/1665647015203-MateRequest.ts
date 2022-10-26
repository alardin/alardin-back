import { MigrationInterface, QueryRunner } from "typeorm"

export class MateRequest1665647015203 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE mate_request_records ADD COLUMN is_accepted boolean NOT NULL DEFAULT 0, 
            ADD COLUMN is_rejected boolean NOT NULL DEFAULT 0`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
