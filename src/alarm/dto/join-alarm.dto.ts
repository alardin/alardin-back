import { IsNotEmpty, IsNumber } from "class-validator";

export class JoinAlarmDto {
    @IsNotEmpty()
    @IsNumber()
    alarmId: number;
}