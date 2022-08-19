import { BadRequestException, Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';
@Injectable()
export class AgoraService {
    constructor(

    ) {}
    private readonly AGORA_APP_ID = process.env.AGORA_APP_ID;
    private readonly AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
    generateRTCToken(channelName: string, role: 'publisher' | 'audience', tokenType: 'userAccount' | 'uid', uid: any, expiry?: number) {
        let rtcRole: number, expireTime: number, token: string; 
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

        if (!expiry) {
            expireTime = 3600;
        }

        const now = Math.floor(Date.now() / 1000);
        const previlegeExpireTime = now + expireTime;

        switch(tokenType) {
            case 'userAccount':
                token = RtcTokenBuilder.buildTokenWithAccount(this.AGORA_APP_ID, this.AGORA_APP_CERTIFICATE, channelName, uid, rtcRole, previlegeExpireTime);
                break;
            
            case 'uid':
                token = RtcTokenBuilder.buildTokenWithUid(this.AGORA_APP_ID, this.AGORA_APP_CERTIFICATE, channelName, uid, rtcRole, previlegeExpireTime);
                break;

            default:
                throw new BadRequestException();
        }
        return {
            rtcToken: token
        };
    }

    
    // generateRtmToken(rtm_uid: string){

    //     expireTimeInSeconds = uint32(3600)
    //     currentTimestamp := uint32(time.Now().UTC().Unix())
    //     expireTimestamp := currentTimestamp + expireTimeInSeconds
    
    //     result, err := rtmtokenbuilder.BuildToken(appID, appCertificate, rtm_uid, rtmtokenbuilder.RoleRtmUser, expireTimestamp)
    //     if err != nil {
    //         fmt.Println(err)
    //     } else {
    //         fmt.Printf("Rtm Token: %s\n", result)
    
    //     rtm_token = result
    
    //     }
    // }
}
