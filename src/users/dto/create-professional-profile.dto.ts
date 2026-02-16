import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProfessionalType } from '@prisma/client';

export class CreateProfessionalProfileDto {
  @ApiProperty({ enum: ProfessionalType, example: 'PERSONAL_TRAINER' })
  @IsEnum(ProfessionalType)
  type: ProfessionalType;

  @ApiProperty({ example: '123456-G/SP', description: 'Número do Registro (CREF, CRN...)' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty({ example: 'Especialista em Hipertrofia e Emagrecimento', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'Musculação, CrossFit', required: false })
  @IsString()
  @IsOptional()
  specialties?: string;
}