import { MigrationInterface, QueryRunner } from "typeorm"

export class AddColumnToAlarmEntity1660909662460 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE 'alarm' ADD 'name' varchar AFTER 'id'`
        );
        await queryRunner.query(
            `ALTER TABLE 'alarm' ADD 'music_name' varchar`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE 'alardin' DROP 'name'`
        );
        await queryRunner.query(
            `ALTER TABLE 'alarm' DROP 'music_name'`
        );
    }

}
