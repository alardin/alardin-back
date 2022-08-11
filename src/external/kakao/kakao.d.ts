import { ApiProperty } from "@nestjs/swagger";

export interface KakaoAccount {
    id: number;
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean
    };
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    has_age_range: boolean;
    age_range_needs_agreement: boolean;
    age_range: string;
    has_birthday: boolean;
    birthday_needs_agreement: boolean;
    birthday: string;
    birthday_type: string;
    has_gender: boolean;
    gender_needs_agreement: boolean;
    gender: string;
}

export interface KakaoAccountUsed {
  id: number;
  email: string;
  nickname: string;
  thumbnail_image_url: string;
  profile_image_url: string;
  age_range: string;
  gender: string;
}

export class KakaoFriend {
  @ApiProperty({
    name: 'profile_nickname',
    example: '한성민'
  })
  profile_nickname: string;
  
  @ApiProperty({
    name:' profile_thumbnail_image',
    example: 'https://p.kakaocdn.net/th/talkp/wniWBRU5fT/KCRXeOtYTeGNvkkoEwoLaK/y7srg3_110x110_c.jpg'
  })
  profile_thumbnail_image: string;
  
  @ApiProperty({
    name: 'allowed_msg',
    example: true
  })
  allowed_msg: boolean;
  
  @ApiProperty({
    name: 'id',
    example: 2348974855
  })
  id: number;

  @ApiProperty({
    name: 'uuid',
    example: 'IBchFCIVIBE9DDQFMwExCTsPIxQiESARJhk'
  })
  uuid: string;

  @ApiProperty({
    name: 'favorite',
    example: false
  })
  favorite: boolean;
}