import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { KakaoService } from './external/kakao/kakao.service';

@Public()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Get()
  async index() {
    await this.appService.test();
    return 'Alardin-backend';
  }
}
