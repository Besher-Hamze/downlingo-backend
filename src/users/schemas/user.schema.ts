import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'student',
  FAMILY = 'family',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  // For family members - link to student
  @Prop({ type: String, ref: 'User' })
  linkedStudentId?: string;

  // For students - link to family
  @Prop({ type: String, ref: 'User' })
  linkedFamilyId?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Daily practice streak
  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ type: Date })
  lastPracticeDate?: Date;

  @Prop({ default: 0 })
  todayWordsPracticed: number;

  @Prop({ default: 5 })
  dailyGoal: number;

  // Tracks which phonemes the student struggles with most
  @Prop({ type: Map, of: Number, default: {} })
  weakPhonemes: Map<string, number>;

  // Tracks cognitive weakness areas: memory, visual, comprehension, pronunciation
  @Prop({ type: Map, of: Number, default: {} })
  cognitiveWeaknesses: Map<string, number>;
}

export const UserSchema = SchemaFactory.createForClass(User);

