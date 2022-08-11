import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ForRoles } from 'src/common/decorators/for-roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AgoraInterceptor } from 'src/common/interceptors/agora.interceptor';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Games } from 'src/entities/games.entity';
import { AgoraService } from 'src/external/agora/agora.service';
import { GenerateTokenDto } from 'src/external/dto/generate-token.dto';
import { GameAnswerDto } from './dto/game.answer.dto';
import { GameChannelDto } from './dto/game.channel.dto';
import { GameImagesDto } from './dto/game.imagess.dto';
import { GameInfoDto } from './dto/game.info.dto';
import { GameResponse } from './dto/game.response.dto';
import { GameService } from './game.service';
import { GameKeywordImages } from './types/game-keyword-images.type';

@Controller('api/game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly agoraService: AgoraService
    ) {}

        @ApiOperation({
            summary: "전체 게임 목록 조회",
        })
        @ApiQuery({
            name:' skip',
            example: 0
        })
        @ApiQuery({
            name: 'take',
            example: 100
        })
        @ApiResponse({
            status: 200,
            type: [Games]
        })
        /**
         * 가져올 갯수 지정 필요
         */
    @Get()
    async getAllGames(@Query('skip') skip: number, @Query('take') take: number) {
        this.gameService.getAllGames(skip, take);
    }

        @ApiOperation({
            summary: '게임 등록',
            description: '데이터 확정되면 추가'
        })
    @Post()
    async createNewGame() {

    }

        @ApiOperation({
            summary: '게임 이미지 데이터 추가'
        })
        @ApiBody({
            type: GameKeywordImages
        })
        @ApiResponse({
            status: 201,
            type: OnlyStatusResponse
        })
    @ForRoles(['admin'])
    @UseGuards(RoleGuard)
    @Put(':gameId/images')
    async addGameImages(@User() user, @Param('gameId') gameId, @Body() gKI: GameKeywordImages) {
        return this.gameService.addGameImages(user.id, gameId, gKI);
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

    @Public()
    @UseInterceptors(AgoraInterceptor)
    @Post('channel')
    createChannel(
        @Body() body: GenerateTokenDto,
        @Query('expiry') expiry: number | undefined
    ) {
        return this.agoraService.generateRTCToken(body.channelName, body.role, body.tokenType, body.uid, expiry);
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


        @ApiOperation({
            summary: '게임 평가',
            description: '1~5점으로 게임 평가'
        })
    @Post('rate')
    rateGame() {
        
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
    getGameDetailById(@User() user, gameId: number) {
        return this.gameService.getGameDetailsById(user.id, gameId);
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
    async purchaseGame(@User() user, gameId: number) {
        return await this.gameService.purchaseGame(user.id, gameId);
    }

}
