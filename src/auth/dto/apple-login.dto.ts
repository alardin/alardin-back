import { IsString } from "class-validator";

export class AppleLoginDto {

    code: string;
    id_token: string;
    user: string;
}