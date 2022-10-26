import { MigrationInterface, QueryRunner } from "typeorm"

export class DropIndex1666620595609 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP INDEX IDX_97672ac88f789774dd47f7c8be`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
