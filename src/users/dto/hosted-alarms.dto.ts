import { ApiProperty } from "@nestjs/swagger"
import { AlarmSummaryDto } from "src/alarm/dto/alarm-summary.dto"
import { UserSummaryDto } from "./user-summary.dto"
export class HostedAlarmsDto extends AlarmSummaryDto {
    @ApiProperty({
        name: 'Host',
        type: UserSummaryDto
    })
    Host: UserSummaryDto
}