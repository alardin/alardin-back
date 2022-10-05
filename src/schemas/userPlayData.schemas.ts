import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserPlayDataDocument = UserPlayData & Document; 

@Schema()
export class UserPlayData {
    
    @Prop({ required: true, unique: true })
    User_id: Number;

    @Prop({ type: Object, required: true })
    play_data: Object;
}

export const UserPlayDataScheme = SchemaFactory.createForClass(UserPlayData);