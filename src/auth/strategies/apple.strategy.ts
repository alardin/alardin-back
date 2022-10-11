import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";

export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
    constructor(config: ConfigService) {
        super({
            clientID: process.env.APPLE_CLIENTID,
            teamID: process.env.APPLE_TEAMID,
            keyID: process.env.APPLE_KEYID,
            keyFilePath: process.env.APPLE_KEYFILE_PATH,
            callbackURL: process.env.APPLE_CALLBACK,
            passReqToCallback: false,
            scope: ['email', 'name'],
          });
    }
}