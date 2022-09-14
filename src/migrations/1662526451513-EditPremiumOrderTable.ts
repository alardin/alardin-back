import { MigrationInterface, QueryRunner } from "typeorm"

export class EditPremiumOrderTable1662526451513 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE premium_orders ADD COLUMN result_status VARCHAR(10), ADD COLUMN result_message VARCHAR(255);`
        );
        await queryRunner.query(
            `ALTER TABLE premium_refund ADD COLUMN result_status VARCHAR(10), ADD COLUMN result_message VARCHAR(255);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `ALTER TABLE premium_orders DROP result_status,
                                        DROP result_message`
        );
        await queryRunner.query(
            `ALTER TABLE premium_refund DROP result_status,
                                        DROP result_message`
        );
    }

}
