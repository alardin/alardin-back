import { ApiProperty, PickType } from "@nestjs/swagger";
import { Mates } from "src/entities/mates.entity";

export class RemoveMateDto extends PickType(Mates, ['id']) {
    @ApiProperty({
        name: 'mateId',
        description: '메이트를 맺고 있는 사람의 id',
        example: '2'
    })
    public mateId: Date
}