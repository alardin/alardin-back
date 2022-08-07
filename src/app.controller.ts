import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { KakaoService } from './external/kakao/kakao.service';

@Public()
@Controller()
export class AppController {
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly appService: AppService
  ) {}

  @Get()
  async test() {
    await this.appService.test();
    return 'hi';
  }

}
