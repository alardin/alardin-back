import { Injectable, Req } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InvalidTokenException } from "src/common/exceptions/invalid-token.exception";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refreshToken') {
    constructor(
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('refresh-token'),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true
        })
    }

    async validate(@Req() req: Request, { sub, email }) {
        const user = this.authService.validateRefreshToken(sub, email, req.header('refresh-token'));
        if (!user) {
            throw new InvalidTokenException();
        }
        return user;
    }
    
}