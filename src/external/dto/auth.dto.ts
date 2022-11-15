import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    name: 'accessToken',
    description: 'access token for kakao api',
    example: 'etA_dfasdfasdf1181723v1_..',
  })
  @IsString()
  @IsNotEmpty()
  public accessToken?: string;
}
