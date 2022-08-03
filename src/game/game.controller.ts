import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Games } from 'src/entities/games.entity';
import { GameAnswerDto } from './dto/game.answer.dto';
import { GameChannelDto } from './dto/game.channel.dto';
import { GameImagesDto } from './dto/game.imagess.dto';
import { GameInfoDto } from './dto/game.info.dto';
import { GameResponse } from './dto/game.response.dto';
import { GameService } from './game.service';

@ApiTags('games')
@ApiHeader({
    name: 'Authorization',
    example: 'Token'
})
@Controller('api/games')
export class GameController {
    constructor(
        private readonly gameService: GameService
    ) {}

    @ApiOperation({
        summary: "전체 게임 목록 조회",
    })
    @ApiResponse({
        status: 200,
        type: [Games]
    })
    @Get()
    getAllGames() {

    }

    @ApiOperation({
        summary: '특정 게임 조회',
        description: 'gameId에 해당하는 게임 조회'
    })
    @ApiParam({
        name: 'gameId',
        example: 1
    })
    @ApiResponse({
        status: 200,
        type: Games
    })
    @Get(':gameId')
    getOneGame() {

    }

    @ApiOperation({
        summary: '게임 구매',
        description: '알람코인을 사용해서 gameId에 해당하는 게임 구매'
    })
    @ApiParam({
        name: 'gameId',
        example: 1
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Post(':gameId')
    purchaseGame() {

    }

    @ApiOperation({
        summary: '채널 생성',
        description: '커뮤니케이션을 위한 미디어 스트림 채널 생성'
    })
    @ApiResponse({
        status: 201,
        type: OnlyStatusResponse
    })
    @ApiBody({
        type: GameChannelDto
    })
    @Put('channel')
    createChannel() {

    }

    @ApiOperation({
        summary: '채널 종료',
        description: '미디어 스트림 채널 종료'
    })
    @ApiBody({
        type: GameChannelDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Delete('channel')
    endChannel() {

    }

    @ApiOperation({
        summary: '채널 참가',
        description: '미디어 스트림 채널 참가'
    })
    @ApiBody({
        type: GameChannelDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Post('channel/in')
    joinChannel() {

    }

    @ApiOperation({
        summary: '채널 나가기',
        description: '미디어 스트림 채널 나가기'
    })
    @ApiBody({
        type: GameChannelDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Post('channel/out')
    leaveChannel() {
        
    }

    @ApiOperation({
        summary: '게임 이미지 목록 가져오기',
        description: '멀티 게임 진행 시 필요한 이미지 목록 가져 옴'
    })
    @ApiResponse({
        status: 200,
        type: GameImagesDto
    })
    @Get('images')
    getImagesForGame() {

    }

    @ApiOperation({
        summary: '정답 제출 및 검사',
        description: '사용자가 제출한 정답과 실제 정답 비교'
    })
    @ApiBody({
        type: GameAnswerDto
    })
    @ApiResponse({
        status: 200,
        type: GameResponse
    })
    @Post('answer')
    checkAnswerImage() {

    }

    @ApiOperation({
        summary: '게임 결과 저장'
    })
    @ApiBody({
        type: GameInfoDto
    })
    @ApiResponse({
        status: 201,
        type: OnlyStatusResponse
    })
    @Post('save')
    saveGame() {

    }

}
