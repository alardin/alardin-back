import { MigrationInterface, QueryRunner } from "typeorm"

export class KakaoTokensNull1665594252967 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users MODIFY kakao_access_token varchar(255), MODIFY email varchar(255), MODIFY name varchar(30)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
