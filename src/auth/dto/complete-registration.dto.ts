import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRegistrationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  motherName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fitnessLevel: string;

  @IsString()
  @IsOptional()
  documentFrontUrl?: string;

  @IsString()
  @IsOptional()
  documentBackUrl?: string;

  @IsString()
  @IsOptional()
  selfieUrl?: string;
}