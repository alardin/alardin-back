import { PickType } from "@nestjs/swagger";
import { AlarmsDto } from "./alarms.dto";

export class ParticipateInAlarmDto extends PickType(AlarmsDto, ['id']) {}