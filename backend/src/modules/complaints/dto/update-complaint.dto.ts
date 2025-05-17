import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class UpdateComplaintDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;
} 