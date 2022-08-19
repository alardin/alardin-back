import { ApiProperty } from "@nestjs/swagger";

export class AnyDataDto {
    @ApiProperty({
        name: '<any key>',
        example: '<any value>'
    })
    key: string;
}