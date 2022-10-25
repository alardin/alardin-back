import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
import { MateRequestRecords } from "./entities/mate-request.records.entity";
import { Users } from "./entities/users.entity";

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(MateRequestRecords)
        private readonly mateReqRepository: Repository<MateRequestRecords>
    ) {
        
    }
    async test() {
        let whereOption: FindOptionsWhere<MateRequestRecords> = { is_accepted: false, is_rejected: false };
        let userOption: FindOptionsSelect<Users> = { id: true, nickname: true, thumbnail_image_url: true };
        const res = await this.mateReqRepository.find({
            select: {
                Receiver: userOption,
                sended_at: true,
            },
            where: {
                Sender_id: 2,
                ...whereOption
            },
            relations: {
                Receiver: true
            }
        });
        return res;
    }
}
