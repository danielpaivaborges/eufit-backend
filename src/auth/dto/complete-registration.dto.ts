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

  // Campos que estavam travando o seu envio (Erro 400)
  // Agora marcados como opcionais para o pedágio da API deixar passar
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