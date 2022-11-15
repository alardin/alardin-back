import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class InsertDto {
  @ApiProperty({
    name: 'name',
    example: '좋아한다는 착각',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'data',
    example: {
      title: '좋아한다는 착각2',
      paragraphs: [
        { paragraph_idx: 1, contents: 'test contents' },
        { paragraph_idx: 2, contents: 'test contents2' },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
  data: object;
}
