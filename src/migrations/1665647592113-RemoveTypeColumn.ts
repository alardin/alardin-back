import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveTypeColumn1665647592113 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE mate_request_records DROP COLUMN type`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
