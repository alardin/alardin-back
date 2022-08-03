import { OmitType } from "@nestjs/swagger";
import { AlarmsDto } from "./alarms.dto";

export class CreateAlarmDto extends OmitType(AlarmsDto, ['id', 'created_at', 'updated_at', 'members']) {}