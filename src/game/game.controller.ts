import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { ForRoles } from 'src/common/decorators/for-roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AgoraInterceptor } from 'src/common/interceptors/agora.interceptor';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Games } from 'src/entities/games.entity';
import { Users } from 'src/entities/users.entity';
import { AgoraService } from 'src/external/agora/agora.service';
import { GenerateTokenDto } from 'src/external/dto/generate-token.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameAnswerDto } from './dto/game.answer.dto';
import { GameChannelDto } from './dto/game.channel.dto';
import { GameInfoDto } from './dto/game.info.dto';
import { GameSummaryDto } from './dto/game.summary.dto';
import { RateGameDto, RateResponse } from './dto/rate-game.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { GameService } from './game.service';
import { GameKeywordImages } from './types/game-keyword-images.type';

@ApiTags('game')
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
            name: 'skip',
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
    @Public()
    @Get()
    async getAllGames(@Query('skip') skip: number, @Query('take') take: number) {
        return this.gameService.getAllGames(skip, take);
    }

        @ApiOperation({
            summary: '게임 등록',
            description: '데이터 확정되면 추가'
        })
        @ApiBody({
            type: CreateGameDto
        })
        @ApiResponse({
            type: OnlyStatusResponse
        })
    @ForRoles(['admin'])
    @UseGuards(RoleGuard)
    @Post()
    async createNewGame(@User() user, @Body() body: CreateGameDto) {
        return this.gameService.createNewGame(user.id, body);
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
    async addGameImages(@User() user: Users, @Param('gameId') gameId: number, @Body() gKI: GameKeywordImages) {
        return this.gameService.addGameImages(user.id, gameId, gKI);
    }

        @ApiOperation({
            summary: 'agora 토큰 생성',
            description: '커뮤니케이션을 위한 rtc 토큰 생성'
        })
        @ApiBody({
            type: GenerateTokenDto
        })
        @ApiQuery({
            name: 'expiry',
            description: '채널 만료 시간, 제공하지 않으면 3600이 기본값 (1일)',
            example: 3600
        })
        @ApiResponse({
            status: 201,
            type: OnlyStatusResponse
        })
    @UseInterceptors(AgoraInterceptor)
    @Post('rtc-token')
    createChannel(
        @Body() body: GenerateTokenDto,
        @Query('expiry') expiry: number | undefined
    ) {
        return this.agoraService.generateRTCToken(body.channelName, body.role, body.tokenType, body.uid, expiry);
    }

        @ApiOperation({
            summary: '채널 종료',
            description: 'developing - 미디어 스트림 채널 종료, 모바일과 의논'
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
            description: 'developing - 미디어 스트림 채널 참가, 모바일과 의논'
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
            description: 'developing - 미디어 스트림 채널 나가기'
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
            summary: '게임 결과 저장'
        })
        @ApiBody({
            type: SaveGameDto
        })
        @ApiResponse({
            status: 201,
            type: OnlyStatusResponse
        })
    @Post('save')
    async saveGame(@User() user, @Body() body: SaveGameDto) {
        return await this.gameService.saveGame(user.id, body);
    }


        @ApiOperation({
            summary: '게임 평가',
            description: '1~5점으로 게임 평가'
        })
        @ApiBody({
            type: RateGameDto
        })
        @ApiResponse({
            status: 200,
            type: RateResponse
        })
    @Post(':gameId/rate')
    rateGame(@User() user, @Body() { gameId, score }: RateGameDto) {
        return this.gameService.rateGame(user.id, gameId, score );
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
    @Public()
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
