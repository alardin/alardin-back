import { Controller, Get, Query } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { KakaoService } from './external/kakao/kakao.service';

@Public()
@Controller()
export class AppController {
  constructor(
  ) {}

  @Get()
  async index() {
    return 'Alardin-backend';
  }
}
