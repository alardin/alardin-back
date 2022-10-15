import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { CreateAlarmDto } from './alarm/dto/create-alarm.dto';
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
  async test(@Body() body: CreateAlarmDto) {
    return await this.appService.test(body);
  }


  // @Public()
  // @Post('insert-data')
  // async insertData(@Body('data') data: InsertDto[]) {
  //   return await this.appService.insert(data);
    
  // }
}
