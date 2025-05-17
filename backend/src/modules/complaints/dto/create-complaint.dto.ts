import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsEnum(Priority)
  @IsNotEmpty()
  priority!: Priority;

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