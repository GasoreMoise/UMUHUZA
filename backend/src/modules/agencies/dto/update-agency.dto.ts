import { IsString, IsOptional } from 'class-validator';

export class UpdateAgencyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
} 