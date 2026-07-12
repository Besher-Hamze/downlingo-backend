import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { LevelType } from '../schemas/level.schema';

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  levelNumber: number;

  @IsNumber()
  @IsNotEmpty()
  requiredPoints: number;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsOptional()
  @IsEnum(LevelType)
  levelType?: LevelType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

