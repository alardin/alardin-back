import { ApiProperty } from '@nestjs/swagger';

export class GameImagesDto {
  @ApiProperty({
    name: 'Q1Images',
    description: '사용자1이 내는 문제 사진들',
    example: [
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
    ],
  })
  public Q1Images: string[];

  @ApiProperty({
    name: 'Q1Answer',
    description: '사용자1이 내는 문제의 정답',
    example: 'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
  })
  public Q1Answer: string;

  @ApiProperty({
    name: 'Q2Images',
    description: '사용자2가 내는 문제 사진들',
    example: [
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
      'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
    ],
  })
  public Q2Images: string[];

  @ApiProperty({
    name: 'Q2Answer',
    description: '사용자2가 내는 문제의 정답',
    example: 'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg',
  })
  public Q2Answer: string;
}
