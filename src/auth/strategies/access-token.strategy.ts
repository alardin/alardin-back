import { Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InvalidTokenException } from "src/common/exceptions/invalid-token.exception";
import { AuthService } from "../auth.service";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'accessToken') {
    constructor(
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate({ sub, email }) {
        const user = this.authService.validateUser(sub, email);
        if (!user) {
            throw new InvalidTokenException();
        }
        return user;
    }

}