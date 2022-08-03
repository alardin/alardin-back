import { OmitType, PickType } from "@nestjs/swagger";
import { Alarms } from "src/entities/alarms.entity";
import { AlarmsDto } from "./alarms.dto";

export class CreateAlarmDto extends PickType(Alarms, ['is_private', 'time', 'is_repeated', 'Game_id', 'music_volume']) {}