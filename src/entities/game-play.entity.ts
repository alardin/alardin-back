import { Entity } from "typeorm";

@Entity({ name: 'game_play', schema: 'alardin' })
export class GamePlay {
    //  alarm
    // memebers
    // images

    /**
     * 알람에 채널 정보 있음,
     * if 채널 접속 멤버 수 == 알람 멤버 수 => 시작
     * else 예외상황인데 처리는 일단 보류
     * 알람 생성 시 랜덤 시드를 함꼐 저장
     */

}