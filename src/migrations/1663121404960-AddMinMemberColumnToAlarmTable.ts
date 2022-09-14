import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMinMemberColumnToAlarmTable1663121404960 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarms ADD min_member TINYINT AFTER max_member;`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarms DROP min_member;`
        )
    }

}
