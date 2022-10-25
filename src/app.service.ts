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
    }
}
