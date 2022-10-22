import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

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
