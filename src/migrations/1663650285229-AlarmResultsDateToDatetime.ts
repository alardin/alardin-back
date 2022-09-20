import { MigrationInterface, QueryRunner } from "typeorm"

export class AlarmResultsDateToDatetime1663650285229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarm_results MODIFY start_time datetime, MODIFY end_time datetime;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarm_results MODIFY start_time date, MODIFY end_time date;`
        );
    }

}
