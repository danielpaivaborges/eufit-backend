import { 
  IsString, 
  IsOptional, 
  IsNotEmpty, 
  IsEnum, 
  Length, 
  IsUrl 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Seguindo exatamente os nomes definidos no seu schema.prisma
export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ATHLETE = 'ATHLETE',
}

export class CompleteRegistrationDto {
  @ApiProperty({ example: '12345678901', description: 'CPF do usuário (apenas números)' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'O CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf: string;

  @ApiProperty({ example: 'Maria Oliveira', description: 'Nome completo da mãe' })
  @IsString()
  @IsNotEmpty()
  motherName: string;

  @ApiProperty({ example: 'João Oliveira', description: 'Nome completo do pai', required: false })
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiProperty({ enum: FitnessLevel, default: FitnessLevel.BEGINNER })
  @IsEnum(FitnessLevel, { message: 'Nível fitness inválido.' })
  @IsNotEmpty()
  fitnessLevel: FitnessLevel;

  // URLs dos documentos que serão processados após o upload
  @ApiProperty({ description: 'URL da foto frontal do documento' })
  @IsString()
  @IsNotEmpty()
  documentFrontUrl: string;

  @ApiProperty({ description: 'URL da foto traseira do documento' })
  @IsString()
  @IsNotEmpty()
  documentBackUrl: string;

  @ApiProperty({ description: 'URL da selfie do usuário com o documento' })
  @IsString()
  @IsNotEmpty()
  selfieUrl: string;

  // No fluxo real, o ID do usuário será capturado pelo JWT, 
  // mas incluímos aqui caso precise passar manualmente em testes iniciais.
  @IsString()
  @IsOptional()
  userId?: string;
}