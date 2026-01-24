import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsNotEmpty()
  arabic: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsString()
  @IsNotEmpty()
  levelId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

