import { MigrationInterface, QueryRunner } from "typeorm"

export class DropIndex1666620848959 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP INDEX IDX_ad02a1be8707004cb805a4b502`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
