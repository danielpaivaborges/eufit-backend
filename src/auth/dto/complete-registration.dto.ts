import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRegistrationDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: 'Nome do Pai', required: false })
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiProperty({ example: 'Nome da Mãe' })
  @IsString()
  @IsNotEmpty()
  motherName: string;

  @ApiProperty({ example: 'BEGINNER' })
  @IsString()
  @IsNotEmpty()
  fitnessLevel: string;

  // Tornamos as URLs opcionais para o servidor aceitar o envio do App sem fotos reais
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  documentFrontUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  documentBackUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selfieUrl?: string;
}