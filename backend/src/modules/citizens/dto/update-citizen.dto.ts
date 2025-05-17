import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateCitizenDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
} 