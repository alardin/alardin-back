import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as S3 from 'aws-sdk/clients/s3';
@Injectable()
export class AwsService {
  private readonly s3 = new S3();

  async uploadToS3(bucketName: string, key: string, file: Express.Multer.File) {
    const uploadParams: S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
    };
    try {
      const { Location } = await this.s3.upload(uploadParams).promise();
      return Location;
    } catch (e) {
      throw new UnauthorizedException('aws exception');
    }
  }
}
