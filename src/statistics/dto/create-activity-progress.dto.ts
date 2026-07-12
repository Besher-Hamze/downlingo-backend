import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateActivityProgressDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  activityId: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  accuracy: number;

  @IsOptional()
  @IsNumber()
  pointsEarned?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  cognitiveCategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wrongAnswers?: string[];
}
