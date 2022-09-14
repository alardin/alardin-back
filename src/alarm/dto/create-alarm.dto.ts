import { PickType } from "@nestjs/swagger";
import { Alarms } from "src/entities/alarms.entity";

export class CreateAlarmDto extends PickType(Alarms, ['is_private', 'time', 'is_repeated', 'Game_id', 'music_volume', 'max_member', 'music_name', 'name']) {}