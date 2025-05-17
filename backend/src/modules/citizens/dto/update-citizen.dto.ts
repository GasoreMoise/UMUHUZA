import { IsEmail, IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateCitizenDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;
} 