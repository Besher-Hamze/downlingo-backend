import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  wordId: string;

  @IsString()
  @IsNotEmpty()
  levelId: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  accuracy: number;

  @IsOptional()
  @IsNumber()
  pointsEarned?: number;

  @IsOptional()
  @IsNumber()
  attempts?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  missingPhonemes?: string[];
}

