import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { GameAnswerDto } from '../dto/game.answer.dto';
import { SingleService } from './single.service';

@Controller('api/game/single')
export class SingleController {

    constructor(
        private readonly singleService: SingleService
    ) {}

    @ApiOperation({
        summary: '싱글 게임 시작',
    })
    @Get ('single/start')
    startSingleGame() {

    }

    @ApiOperation({
        summary: '싱글 게임 답안 제출'
    })
    @ApiBody({
        type: GameAnswerDto
    })
    @Post('single/answer')
    checkSingleGameAnswer() {

    }

    @ApiOperation({
        summary: '싱글 게임 결과 저장'
    })
    @Post('single/save')
    saveSingleGame() {

    }
}
