import { Injectable } from '@nestjs/common';
import { KakaoService } from './external/kakao/kakao.service';

@Injectable()
export class AppService {
    constructor(
        private readonly kakaoServce: KakaoService,
    ) {}

    async test() {
        await this.kakaoServce.getKakaoProfileTest();
    }
}
