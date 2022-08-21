import { PickType } from "@nestjs/swagger";
import { Alarms } from "src/entities/alarms.entity";

export class AlarmSummaryDto extends PickType(Alarms, ['id', 'name', 'time', 'is_repeated', 'is_private', 'music_name' ,'max_members', 'created_at']) {}