import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  STORY = 'story',
  SHAPES = 'shapes',
  COLORS = 'colors',
  EMOTIONS = 'emotions',
  HUNT = 'hunt',
}

export enum CognitiveCategory {
  MEMORY = 'memory',
  COMPREHENSION = 'comprehension',
  VISUAL = 'visual',
  PRONUNCIATION = 'pronunciation',
}

@Schema({ _id: false })
export class StoryQuestion {
  @Prop({ required: true })
  prompt: string;

  @Prop()
  promptAr?: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [String] })
  optionsAr?: string[];

  @Prop({ required: true })
  correctIndex: number;
}

export const StoryQuestionSchema = SchemaFactory.createForClass(StoryQuestion);

@Schema({ _id: false })
export class ActivityContent {
  @Prop({ type: [String] })
  pages?: string[];

  @Prop({ type: [String] })
  pagesAr?: string[];

  @Prop({ type: [StoryQuestionSchema] })
  questions?: StoryQuestion[];

  @Prop()
  prompt?: string;

  @Prop()
  promptAr?: string;

  @Prop()
  correctAnswer?: string;

  @Prop({ type: [String] })
  options?: string[];

  @Prop({ type: [String] })
  optionIcons?: string[];

  @Prop({ type: [String] })
  optionLabels?: string[];

  @Prop({ type: [String] })
  optionLabelsAr?: string[];
}

export const ActivityContentSchema = SchemaFactory.createForClass(ActivityContent);

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  title: string;

  @Prop()
  titleAr?: string;

  @Prop({ type: String, ref: 'Level' })
  levelId?: string;

  @Prop({ default: 'english' })
  language: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 10 })
  points: number;

  @Prop({ default: 'easy' })
  difficulty: string;

  @Prop({ enum: CognitiveCategory, default: CognitiveCategory.COMPREHENSION })
  cognitiveCategory: CognitiveCategory;

  @Prop({ type: ActivityContentSchema, required: true })
  content: ActivityContent;

  @Prop({ default: true })
  isActive: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
