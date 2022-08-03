import { ApiProperty, PickType } from "@nestjs/swagger";
import { Mates } from "src/entities/mates.entity";

export class RemoveMateDto extends PickType(Mates, ['id']) {
    @ApiProperty({
        name: 'now',
        example: '2022-07-22:00:00:00'
    })
    public now: Date
}