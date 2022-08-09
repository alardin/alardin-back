import { Injectable } from '@nestjs/common';
import * as S3 from 'aws-sdk/clients/s3';
import uuid from 'uuid'; 
@Injectable()
export class AwsService {
    #s3 = new S3();
    async getBucketList() {
        const bucks = await this.#s3.listBuckets().promise();
        console.log(bucks);
    }
}