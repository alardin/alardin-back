import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

class InsertDto {

  @IsNumber()
  @IsNotEmpty()
  Game_id: number;

  @IsObject()
  @IsNotEmpty()
  data: object;
}

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

  @Public()
  @Post('bf75b53a1c85c18ac77b7262fec2e0910899f7791669db2198ee8f51f0712c1a')
  async insertData(@Body('data') data: InsertDto[]) {
    return await this.appService.insert(data);
    
  }
}
