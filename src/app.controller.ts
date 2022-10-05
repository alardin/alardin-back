import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Public()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Get()
  async index() {
    return 'Alardin-backend';
  }
  @Public()
  @Get('test')
  async test() {
    return await this.appService.test();
  }
}
