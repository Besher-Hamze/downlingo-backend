import { IsString, IsOptional, IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  linkedStudentId?: string;

  @IsOptional()
  @IsString()
  linkedFamilyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

