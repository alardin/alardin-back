import { MigrationInterface, QueryRunner } from "typeorm"

export class KakaoRefreshTokensNull1665594595620 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users MODIFY kakao_refresh_token varchar(255)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
