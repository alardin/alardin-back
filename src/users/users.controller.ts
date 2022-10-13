import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { OthersProfileDto } from './dto/others.profile.dto';
import { UserAlarmsDto } from './dto/user-alarms.dto';

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
            summary: '회원 탈퇴'
        })
    @Delete()
    async deleteUser(@Req() req, @User() user) {
        req.logout();
        return await this.usersService.deleteUser(user.id);
    }

    @UseGuards(LoggedInGuard)
    @Post('logout')
    async logout(@Req() req, @User() user: Users) {
        req.logout();
        this.usersService.destroyToken(user.id);
        // appAccessToken 파기, kakaoAT, kakaoRT 파기
    }
        @ApiOperation({
            summary: 'access token 재발급',
            description: 'refresh token 이용해서 access token 재발급'
        })
        @ApiHeader({
            name: 'Refresh-Token',
            example: 'jwt refresh token'
        })
        @ApiResponse({
            status: 200,
            type: AppTokens
        })
    @Public()
    @UseGuards(new RefreshTokenGuard())
    @Get('refresh')
    async refreshToken(@Req() req, @User() user: Users) {
        console.log(req.headers);
        if (user.kakao_id) {
            await this.usersService.refreshKakaoToken(user.id);
        } 
        return await this.usersService.refreshAppToken(user.id);
    }

        @ApiOperation({
            summary: '참가 중인 알람 조회',
            description: '로그인한 사용자가 참여하고 있는 모든 알람 조회'
        })
        @ApiResponse({
            status: 200,
            type: UserAlarmsDto
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
            name: 'skip',
            required: true,
        })
        @ApiQuery({
            name: 'take',
            required: true,
        })
        @ApiResponse({
            status: 200,
            type: AlarmResults
        })
    @Get('alarm-results')
    async getAlarmRecords(@User() user, @Query('skip') skip: number, @Query('take') take: number) {
        return await this.usersService.getUserAlarmRecords(user.id, skip, take);
    }
    
        @ApiOperation({
            summary: '날짜 순 알람 플레이 기록 조회'
        })
    @Get('history')
    async getUserHistory(@User() user) {
        return await this.usersService.getUserHistoryByAlarm(user.id);
    }

    @ApiOperation({
        summary: '메이트별  플레이 기록 조회'
    })
    @Get('history-count')
    async getUserHistoyByCount(@User() user) {
        return this.usersService.getUserHistoryByCount(user.id);
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
        @ApiParam({
            name: 'targetId',
            example: 1,
            description: '조회할 사용자의 id'
        })
        @ApiResponse({
            status: 200,
            type: OthersProfileDto,
        })
    @Get(':targetId')
    async getUserProfile(@Param('targetId') targetId, @User() user) {
        return await this.usersService.getUserProfile(user.id, targetId);
    }

}
