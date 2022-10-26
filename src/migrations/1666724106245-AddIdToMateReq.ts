import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIdToMateReq1666724106245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE mate_request_records DROP PRIMARY KEY`
        );
        await queryRunner.query(
            `ALTER TABLE mate_request_records ADD id INT PRIMARY KEY AUTO_INCREMENT;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
