import { MigrationInterface, QueryRunner } from "typeorm"

export class AddExpiredAtColumn1665671748542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE alarms ADD COLUMN expired_at datetime(6)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
