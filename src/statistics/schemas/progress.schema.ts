import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: String, ref: 'User', required: true })
  studentId: string;

  @Prop({ type: String, ref: 'Word', required: true })
  wordId: string;

  @Prop({ type: String, ref: 'Level', required: true })
  levelId: string;

  @Prop({ required: true, min: 0, max: 1 })
  accuracy: number; // 0.0 to 1.0

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
ProgressSchema.index({ studentId: 1, wordId: 1 }, { unique: true });

