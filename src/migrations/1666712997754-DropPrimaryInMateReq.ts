import { MigrationInterface, QueryRunner } from "typeorm"

export class DropPrimaryInMateReq1666712997754 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE mate_request_records DROP FOREIGN KEY FK_ea34042e3ce06982f1258f3a9eb, DROP FOREIGN KEY FK_6d5980da5846c53e306e52291bc`
        );
        await queryRunner.query(
            `ALTER TABLE mate_request_records DROP PRIMARY KEY`
        );
        await queryRunner.query(
            `ALTER TABLE mate_request_records ADD CONSTRAINT PRIMARY KEY (sended_at, Sender_id, Receiver_id)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
