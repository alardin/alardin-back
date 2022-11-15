import { IsString } from 'class-validator';

export class AppleLoginDto {
  email: string | null;
  fullName: {
    familyName: string | null;
    givenName: string | null;
    middleName: string | null;
    namePrefix: string | null;
    nameSuffix: string | null;
    nickname: string | null;
  };
  identityToken: string;
  nonce: string;
  deviceToken: string;
}
