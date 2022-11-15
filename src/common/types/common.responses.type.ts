import { ApiProperty } from '@nestjs/swagger';
import { stringify } from 'querystring';

export class OnlyStatusResponse<T> {
  @ApiProperty({
    name: 'status',
    example: 'OK',
  })
  public status: 'OK' | 'FAIL';

  @ApiProperty({
    name: 'data',
    example: 'something in description',
  })
  public data: T;
}
