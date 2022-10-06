import { ApiProperty, PickType } from "@nestjs/swagger";
import { Alarms } from "src/entities/alarms.entity";

export class CreateAlarmDto extends PickType(Alarms, ['is_private', 'time', 'is_repeated', 'Game_id', 'music_volume', 'max_member', 'music_name', 'name']) {
    @ApiProperty({
        name: 'data',
        description: 'optional data for games',
        example: { title: '좋아한다는 착각', 'info': 'data is optional for games needed to use data' }
    })
    data: object;
}