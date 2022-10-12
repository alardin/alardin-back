import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthDto } from 'src/users/dto/auth.dto';
import { AuthService } from './auth.service';
import { AppleLoginDto } from './dto/apple-login.dto';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @UseGuards(AuthGuard('apple'))
    @Get('apple')
    async appleLogin(): Promise<any> {
        // update device token;
        return 'OK'
    }

    @Post('kakao')
    async kakaoAuth(@Body() tokens: AuthDto) {
        return await this.authService.kakaoAuth(tokens);
    }

    @Public()
    @Post('apple')
    async appleAuth(@Body() data: AppleLoginDto) {
        await this.authService.appleAuth(data, data.deviceToken);
    }

}
