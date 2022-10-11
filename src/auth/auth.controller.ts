import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

}
