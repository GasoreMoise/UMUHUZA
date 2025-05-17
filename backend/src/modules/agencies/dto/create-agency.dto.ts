import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgencyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
} 