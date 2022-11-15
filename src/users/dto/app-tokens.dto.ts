import { ApiProperty } from '@nestjs/swagger';

export class AppTokens {
  @ApiProperty({
    name: 'appAccessToken',
    example: 'jwt for app access token',
  })
  appAccessToken: string;

  @ApiProperty({
    name: 'appRefreshToken',
    example: 'jwt for app refresh token',
  })
  appRefreshToken: string;
}
