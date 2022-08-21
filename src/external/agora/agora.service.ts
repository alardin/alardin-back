import { BadRequestException, Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';
@Injectable()
export class AgoraService {
    constructor(

    ) {}
    private readonly AGORA_APP_ID = process.env.AGORA_APP_ID;
    private readonly AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
    generateRtcToken(channelName: string, role: 'publisher' | 'audience', tokenType: 'userAccount' | 'uid', uid: any, expiry?: number) {
        let rtcRole: number, token: string; 
        switch(role) {
            case 'publisher':
                rtcRole = RtcRole.PUBLISHER;
                break;
            
            case 'audience':
                rtcRole = RtcRole.SUBSCRIBER;
                break;

            default:
                throw new BadRequestException();
        }

        const expireTime: number = expiry ? expiry : 3600;

        const now = Math.floor(Date.now() / 1000);
        const previlegeExpireTime = now + expireTime;
        if (tokenType === 'uid' && typeof uid === 'number') {
            token = RtcTokenBuilder.buildTokenWithUid(this.AGORA_APP_ID, this.AGORA_APP_CERTIFICATE, channelName, uid, rtcRole, previlegeExpireTime);
        }
        
        return token;
    }

    generateRtmToken(account: string, expiry?: number){
        if (!account) {
            return null;
        }
        const expireTime: number = expiry ? expiry : 3600;
        const now = Math.floor(Date.now() / 1000);
        const previlegeExpireTime = now + expireTime;
        const rtmToken = RtmTokenBuilder.buildToken(this.AGORA_APP_ID, this.AGORA_APP_CERTIFICATE, account, RtmRole.Rtm_User, previlegeExpireTime);
        
        return rtmToken;

    }
}
