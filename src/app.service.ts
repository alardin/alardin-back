import { Injectable } from '@nestjs/common';
import { KakaoService } from './external/kakao/kakao.service';

@Injectable()
export class AppService {
    constructor(
        private readonly kakaoService: KakaoService,
    ) {}

}
