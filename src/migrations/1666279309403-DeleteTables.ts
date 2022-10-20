import { MigrationInterface, QueryRunner } from "typeorm"

export class DeleteTables1666279309403 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP table`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
