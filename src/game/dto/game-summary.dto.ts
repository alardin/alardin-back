import { PickType } from '@nestjs/swagger';
import { Games } from 'src/entities/games.entity';

export class GameSummaryDto extends PickType(Games, [
  'id',
  'name',
  'thumbnail_url',
]) {}
