import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityProgressDocument = ActivityProgress & Document;

@Schema({ timestamps: true })
export class ActivityProgress {
  @Prop({ type: String, ref: 'User', required: true })
  studentId: string;

  @Prop({ type: String, ref: 'Activity', required: true })
  activityId: string;

  @Prop({ required: true })
  activityType: string;

  @Prop({ type: String, ref: 'Level' })
  levelId?: string;

  @Prop({ required: true, min: 0, max: 1 })
  accuracy: number;

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  cognitiveCategory?: string;

  @Prop({ type: [String], default: [] })
  wrongAnswers?: string[];
}

export const ActivityProgressSchema =
  SchemaFactory.createForClass(ActivityProgress);
ActivityProgressSchema.index({ studentId: 1, activityId: 1 }, { unique: true });
