import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType, CognitiveCategory } from '../schemas/activity.schema';
import { CreateActivityDto } from './create-activity.dto';

export class UpdateActivityDto implements Partial<CreateActivityDto> {
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  title?: string;

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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  content?: CreateActivityDto['content'];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
