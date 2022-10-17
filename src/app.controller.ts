import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { MateRequestReponseDto } from './mate/dto/mate-request.response.dto';


@Public()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Post()
  async index() {
    return 'Alardin-backend';
  }
  
  @Public()
  @Get('test')
  async test(@Query('key') key:string) {
    return await this.appService.test();
  }
}
