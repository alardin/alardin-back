import { ApiProperty, PickType } from '@nestjs/swagger';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';

export class MateListDto extends PickType(Mates, ['id', 'created_at']) {
  @ApiProperty({
    name: 'Sender',
    description: '메이트 요청자',
    type: Users,
  })
  Sender: Users;
  @ApiProperty({
    name: 'Receiver',
    description: '메이트 수신자',
    type: Users,
  })
  Receiver: Users;
}
