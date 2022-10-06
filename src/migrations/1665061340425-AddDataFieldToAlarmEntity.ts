import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDataFieldToAlarmEntity1665061340425 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarms ADD data json DEFAULT (JSON_OBJECT());`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarms DROP data;`
        )
    }

}
