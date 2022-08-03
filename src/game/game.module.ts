import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SingleModule } from './single/single.module';

@Module({
  providers: [GameService],
  controllers: [GameController],
  imports: [SingleModule]
})
export class GameModule {}
