import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDataDocument = GameData & Document;

@Schema()
export class GameData {
  @Prop({ required: true })
  Game_id: Number;

  @Prop({ type: Object, required: true })
  data: Object;
}

export const GameDataSchema = SchemaFactory.createForClass(GameData);
