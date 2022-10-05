import { Injectable } from "@nestjs/common";
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
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true
        })
    }

    async validate(req: Request, { sub, email }) {
        const user = await this.authService.validateRefreshToken(sub, email, req.query['refreshToken']);
        // TODO: kakao accessToken
        if (!user) {
            throw new InvalidTokenException();
        }
        return user;
    }
    
}