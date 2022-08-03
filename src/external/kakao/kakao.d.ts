export interface KakaoAccount {
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
  email: string;
  nickname: string;
  thumbnail_image_url: string;
  profile_image_url: string;
  age_range: string;
  gender: string;
}