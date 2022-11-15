import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SendPushDto } from './send-push.dto';

export class SendTopicDto extends SendPushDto {
  @ApiProperty({
    name: 'topic',
    example: 'all',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
