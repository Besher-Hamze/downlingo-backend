import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  word?: string;

  @IsOptional()
  @IsString()
  arabic?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

