import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WordDocument = Word & Document;

@Schema({ timestamps: true })
export class Word {
  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  arabic: string;

  @Prop({ required: true })
  icon: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  audioUrl?: string;

  @Prop({ type: String, ref: 'Level' })
  levelId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WordSchema = SchemaFactory.createForClass(Word);

