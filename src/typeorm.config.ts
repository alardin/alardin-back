import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AlarmMembers } from "./entities/alarm.members.entity";
import { AlarmPlayRecords } from "./entities/alarm.play.records.entity";
import { AlarmResults } from "./entities/alarm.results.entity";
import { Alarms } from "./entities/alarms.entity";
import { Assets } from "./entities/assets.entity";
import { CoinUseRecords } from "./entities/coin.use.records.entity";
import { GamePurchaseRecords } from "./entities/game.purchase.records.entity";
import { Games } from "./entities/games.entity";
import { GamesRatings } from "./entities/games.ratings.entity";
import { GamesScreenshots } from "./entities/games.screenshots.entity";
import { MateRequestRecords } from "./entities/mate-request.records.entity";
import { Mates } from "./entities/mates.entity";
import { Notifications } from "./entities/notifications.entity";
import { PremiumOrders } from "./entities/premium.orders.entity";
import { PremiumRefunds } from "./entities/premium.refunds.entity";
import { Premiums } from "./entities/premiums.entity";
import { Users } from "./entities/users.entity";

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root', 
    password: '63104225',
    database: 'alardin',
    entities: [
        AlarmMembers,
        AlarmPlayRecords,
        AlarmResults,
        Alarms,
        Assets,
        CoinUseRecords,
        GamePurchaseRecords,
        Games,
        GamesRatings,
        GamesScreenshots,
        Mates,
        MateRequestRecords,
        Notifications,
        Premiums,
        Users,
        PremiumOrders,
        PremiumRefunds,
    ],
    logging: true,
    synchronize: false
}