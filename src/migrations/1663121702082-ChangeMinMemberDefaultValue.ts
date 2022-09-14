import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangeMinMemberDefaultValue1663121702082 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `ALTER TABLE alarms ALTER COLUMN min_member SET DEFAULT 1;`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
