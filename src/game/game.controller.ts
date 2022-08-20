import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForRoles } from 'src/common/decorators/for-roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AgoraInterceptor } from 'src/common/interceptors/agora.interceptor';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Games } from 'src/entities/games.entity';
import { Users } from 'src/entities/users.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { RateGameDto, RateResponse } from './dto/rate-game.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { StartGameDto } from './dto/start-game.response.dto';
import { GameService } from './game.service';
import { GameKeywordImages } from './types/game-keyword-images.type';

@ApiTags('game')
@Controller('api/game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
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
    @UseGuards(new RoleGuard(new Reflector()))
    @ForRoles(['admin'])
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
    @UseGuards(new RoleGuard(new Reflector()))
    @Put(':gameId/images')
    async addGameImages(@User() user: Users, @Param('gameId') gameId: number, @Body() gKI: GameKeywordImages) {
        return this.gameService.addGameImages(user.id, gameId, gKI);
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
    async rateGame(@User() user, @Body() { score }: RateGameDto, @Param('gameId') gameId) {
        return await this.gameService.rateGame(user.id, gameId, score );
    }
    
    @ApiOperation({
        summary: '게임 시작',
        description: '게임 시작, Agora를 이용하기 위해 필요한 토큰 발행'
    })
    @ApiQuery({
        name: 'alarmId',
        example: 1
    })
    @ApiResponse({
        type: StartGameDto
    })
    @UseInterceptors(AgoraInterceptor)
    @Post('start')
    async startGame(@User() user, @Query('alarmId') alarmId, @Query('expiry') expiry) {
        return await this.gameService.startGame(user.id, alarmId, expiry);
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
    async getGameDetailById(@User() user, gameId: number) {
        return await this.gameService.getGameDetailsById(user.id, gameId);
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
    async purchaseGame(@User() user, @Param('gameId') gameId: number) {
        return await this.gameService.purchaseGame(user.id, gameId);
    }

}
