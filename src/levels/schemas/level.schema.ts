import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LevelDocument = Level & Document;

@Schema({ timestamps: true })
export class Level {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  levelNumber: number;

  @Prop({ required: true })
  requiredPoints: number;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  language: string; // 'english' or 'arabic'

  @Prop({ default: true })
  isActive: boolean;
}

export const LevelSchema = SchemaFactory.createForClass(Level);

