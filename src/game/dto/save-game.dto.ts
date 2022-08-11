import { PickType } from "@nestjs/swagger";
import { AlarmResults } from "src/entities/alarm.results.entity";

export class SaveGameDto extends PickType(AlarmResults, ['start_time', 'end_time', 'play_time', 'trial', 'Game_id', 'is_bot_used', 'is_cleared',]) {

}