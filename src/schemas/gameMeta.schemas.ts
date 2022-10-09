import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type GameMetaDocument = GameMeta & Document;

@Schema()
export class GameMeta {

    @Prop({ required: true })
    Game_id: number;

    @Prop({ required: true })
    data_type: string;

    @Prop({ required: true })
    keys: string[];

    @Prop({ required: true, default: [] })
    screenshot_urls: string[];
}

export const GameMetaSchema = SchemaFactory.createForClass(GameMeta);