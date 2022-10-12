import { MigrationInterface, QueryRunner } from "typeorm"

export class KakaoNullable1665549809995 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users MODIFY kakao_id bigint, MODIFY email varchar(256)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
