import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlarmsDto } from 'src/alarm/dto/alarms.dto';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Users } from 'src/entities/users.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { AuthDto } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { UsersService } from './users.service';
import { LoggedInGuard } from 'src/common/guards/logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { AppTokens } from './dto/app-tokens.dto';
import { NotLoggedInGuard } from 'src/common/guards/not-logged-in.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiHeader({
    name: 'Authorization',
    example: 'Token'
})
@ApiTags('users')
@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}
    
        @ApiResponse({
            status: 200,
            type: Users,
        })
        @ApiOperation({
            summary: '사용자 조회',
            description: '로그인한 사용자의 정보 조회'
        })
    @Get()
    getUser(@User() user) {
        return user;
    }

        @ApiOperation({
            summary: '카카오 로그인/회원가입',
        })
        @ApiBody({
            type: AuthDto
        })
    @Public()
    @UseGuards(NotLoggedInGuard)
    @Post('auth')
    async kakaoAuth(@Body() tokens: AuthDto): Promise<AppTokens> {
        return await this.usersService.auth(tokens);
    }

    @UseGuards(LoggedInGuard)
    @Post('logout')
    async logout(@Req() req, @User() user: Users) {
        this.usersService.logout(user.id);
        // appAccessToken 파기, kakaoAT, kakaoRT 파기
    }
        
    @Public()
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    async refreshToken(@User() user: Users, @Query('refreshToken') refreshToken) {
        console.log(user);
        return await this.usersService.refreshTokens(user.id, refreshToken);
    }

        @ApiOperation({
            summary: '참가 중인 알람 조회',
            description: '로그인한 사용자가 참여하고 있는 모든 알람 조회'
        })
        @ApiResponse({
            status: 200,
            type: [AlarmsDto]
        })

    @Get('joined-alarms')
    async getAlarms(@User() user) {
        const hostedAlarms = await this.usersService.getUsersHostedAlarm(user.id);
        const joinedAlarms = await this.usersService.getUsersJoinedAlarm(user.id);
        return { hostedAlarms, joinedAlarms };
    }
        
        @ApiOperation({
            summary: '사용자의 알람 기록 조회',
            description: '로그인한 사용자의 알람 기록 조회'
        })
        @ApiQuery({
            name: 'start_date',
            required: true,
            description: '조회 시작할 날짜'
        })
        @ApiQuery({
            name: 'period',
            required: true,
            description: '조회할 일수'
        })
        @ApiResponse({
            status: 200,
            type: AlarmResults
        })
    @Get('alarm-records')
    async getAlarmRecords(@User() user) {
        return await this.usersService.getUserAlarmRecords(user.id);
    }
    
        @ApiOperation({
            summary: '프로필 수정',
            description: '로그인한 사용자 자신의 프로필 수정'
        })
        @ApiBody({
            type: EditProfileDto
        })
        @ApiResponse({
            status: 201,
            type: OnlyStatusResponse
        })
    @Post('edit')
    async editProfile(@Body() body: EditProfileDto, @User() user) {
        return await this.usersService.editUserProfile(user.id, body);
    }
    
        @ApiOperation({
            summary: '특정 id 사용자 정보 조회',
            description: '특정 id 사용자의 프로필 정보 조회'
        })
        @ApiResponse({
            status: 200,
            type: Users,
        })
        @ApiParam({
            name: 'targetId',
            example: 1,
            description: '조회할 사용자의 id'
        })
    @Get(':targetId')
    async getUserProfile(@Param('targetId') targetId, @User() user) {
        return await this.usersService.getUserProfile(user.id, targetId);
    }
}
