import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType, CognitiveCategory } from '../schemas/activity.schema';

class StoryQuestionDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsString()
  promptAr?: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionsAr?: string[];

  @IsNumber()
  @Min(0)
  correctIndex: number;
}

class ActivityContentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pagesAr?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoryQuestionDto)
  questions?: StoryQuestionDto[];

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  promptAr?: string;

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionIcons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionLabels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionLabelsAr?: string[];
}

export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsEnum(CognitiveCategory)
  cognitiveCategory?: CognitiveCategory;

  @IsObject()
  @ValidateNested()
  @Type(() => ActivityContentDto)
  content: ActivityContentDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
