import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateCitizenDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;
} 