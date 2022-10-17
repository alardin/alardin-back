import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { NotLoggedInGuard } from 'src/common/guards/not-logged-in.guard';
import { AppTokens } from 'src/users/dto/app-tokens.dto';
import { AuthDto } from 'src/users/dto/auth.dto';
import { AuthService } from './auth.service';
import { AppleLoginDto } from './dto/apple-login.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

        @ApiOperation({
            summary: '카카오 로그인/회원가입',
        })
        @ApiBody({
            type: AuthDto
        })
        @ApiResponse({
            status: 201,
            type: AppTokens
        })
    @Public()
    @UseGuards(NotLoggedInGuard)
    @Post('kakao')
    async kakaoAuth(@Body() tokens: AuthDto) {
        const res = await this.authService.kakaoAuth(tokens);
        return res;
    }

        @ApiOperation({
            summary: '애플 로그인/회원가입',
        })
        @ApiBody({
            type: AppleLoginDto
        })
        @ApiResponse({
            status: 201,
            type: AppTokens
        })
    @Public()
    @UseGuards(NotLoggedInGuard)
    @Post('apple')
    async appleAuth(@Body() data: AppleLoginDto) {
        return await this.authService.appleAuth(data, data.deviceToken);
    }

}
