import { IsNotEmpty, IsString } from "class-validator";

export class GameKeywordImages {
    @IsString()
    @IsNotEmpty()
    keyword: string;
    
    @IsNotEmpty()
    images: string[];
} 