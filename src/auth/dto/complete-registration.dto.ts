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

  // Campos que o erro 400 reclamou: agora são opcionais para o aceite do backend
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