import { MigrationInterface, QueryRunner } from "typeorm"

export class AppleNull1666619963285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users MODIFY apple_id varchar(100), MODIFY apple_id varchar(256)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
