import { MigrationInterface, QueryRunner } from "typeorm"

export class EditConfigure1665671307365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `SET @@session.time_zone='+00:00';`
        );
        await queryRunner.query(
            `SET @@global.time_zone='+00:00';`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
