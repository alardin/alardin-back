import { PickType } from "@nestjs/swagger";
import { Alarms } from "src/entities/alarms.entity";

export class AlarmSummaryDto extends PickType(Alarms, ['id', 'time', 'is_repeated', 'is_private', 'music_volume' ,'max_members', 'created_at']) {}