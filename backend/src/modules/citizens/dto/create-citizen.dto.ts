// @ts-nocheck
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCitizenDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
} 