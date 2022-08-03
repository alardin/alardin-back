import { PickType } from "@nestjs/swagger";
import { Users } from "src/entities/users.entity";

export class OthersProfileDto extends PickType(Users, ['id', 'email', 'name', 'nickname', 'thumbnail_image_url', 'bio', 'gender']) {
    
}