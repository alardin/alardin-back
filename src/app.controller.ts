import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Public()
@Controller()
export class AppController {
  constructor(
  ) {}

  @Get()
  index() {
    return 'Alardin-backend';
  }
}
