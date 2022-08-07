import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GenerateTokenDto {
    
    @IsNotEmpty()
    @IsString()
    channelName: string;

    @IsNotEmpty()
    @IsString()
    role: string;
    
    @IsNotEmpty()
    @IsString()
    tokenType: string;

    @IsNotEmpty()
    @IsString()
    uid: string;
}