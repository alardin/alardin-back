import { Injectable } from '@nestjs/common';
import * as S3 from 'aws-sdk/clients/s3';
@Injectable()
export class AwsService {
    #s3 = new S3();
    async getBucketList() {
        const bucks = await this.#s3.listBuckets().promise();
        
    }

    async getObjectsOfBucket(bucketName: string, key: string) {
        const bucketParams = {
            Bucket: bucketName
        } 
        const { Contents } = await this.#s3.listObjects(bucketParams).promise();
<<<<<<< HEAD
        
=======
>>>>>>> develop
    }

    async getObject(bucketName: string, key: string) {
        const objectParams = {
            Bucket: bucketName,
            Key: key
        }
        const res = await this.#s3.getObject(objectParams).promise();
<<<<<<< HEAD
        
=======
>>>>>>> develop
    }
    async uploadFileToBucket(bucketName: string) {
        const uploadParams: S3.PutObjectRequest = {
            Bucket: bucketName,
            Key: 'images/test2',
            Body: 'test'
        }
        const res = await this.#s3.upload(uploadParams).promise();
<<<<<<< HEAD
        
=======
>>>>>>> develop
    }
}