import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { LevelType } from '../schemas/level.schema';

export class UpdateLevelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  levelNumber?: number;

  @IsOptional()
  @IsNumber()
  requiredPoints?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(LevelType)
  levelType?: LevelType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

