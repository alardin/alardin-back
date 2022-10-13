import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDeletedAt1665650559483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE mate_request_records ADD COLUMN deleted_at datetime(6)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
