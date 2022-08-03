import { PickType } from "@nestjs/swagger";
import { Users } from "src/entities/users.entity";

export class EditProfileDto extends PickType(Users, ['nickname', 'profile_image_url', 'thumbnail_image_url', 'bio']) {
}