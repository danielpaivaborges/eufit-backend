import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SpaceType } from '@prisma/client';

export class CreateSpaceProfileDto {
  @ApiProperty({ example: 'Ironberg Gym', description: 'Nome Fantasia' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: SpaceType, example: 'GYM' })
  @IsEnum(SpaceType)
  type: SpaceType;

  @ApiProperty({ example: '12.345.678/0001-90', required: false })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({ example: 'Academia completa com ar condicionado', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  // --- Endereço do Espaço (Obrigatório) ---
  
  @ApiProperty({ example: 'Rua dos Marombas' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '01000-000' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;
}