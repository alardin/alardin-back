import { ApiProperty } from '@nestjs/swagger';

export class StartGameDto {
  @ApiProperty({
    name: 'rtcToken',
    example: '<Token>',
  })
  rtcToken: string;

  @ApiProperty({
    name: 'rtmToken',
    example: '<Token>',
  })
  rtmToken: string;

  @ApiProperty({
    name: 'player1Keyword',
    example: '"blue_cat_sleep"',
  })
  player1Keyword: string;

  @ApiProperty({
    name: 'player1Images',
    example: [
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
    ],
  })
  player1Images: string[];

  @ApiProperty({
    name: 'player1AnswerIndex',
    example: 3,
  })
  player1AnswerIndex: number;

  @ApiProperty({
    name: 'player2Keyword',
    example: 'cat_lion_hat',
  })
  player2Keyword: string;

  @ApiProperty({
    name: 'player2Images',
    example: [
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
      'http://images/image.jpg',
    ],
  })
  player2Images: string[];

  @ApiProperty({
    name: 'player2AnswerIndex',
    example: 4,
  })
  player2AnswerIndex: number;

  @ApiProperty({
    name: 'channelName',
    example: '1',
  })
  channelName: string;
}
