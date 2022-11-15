import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/users.entity';

export class UserSummaryDto extends PickType(Users, [
  'id',
  'nickname',
  'thumbnail_image_url',
]) {}
