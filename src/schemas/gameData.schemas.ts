import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type GameDataDocument = GameData & Document;

@Schema()
export class GameData {
    @Prop({ required: true })
    Game_id: Number;

    @Prop({ required: true })
    data_type: String;

    @Prop({ type: Object, required: true })
    data: Object;

    @Prop({ required: true })
    keys: String[];
}

export const GameDataSchema = SchemaFactory.createForClass(GameData);