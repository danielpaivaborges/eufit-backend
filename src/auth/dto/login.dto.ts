import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO responsável por validar os dados de entrada no momento do Login.
 * Seguindo a regra de negócio do EUFIT: Identificação via Telefone.
 */
export class LoginDto {
  @ApiProperty({
    example: '5531999999999',
    description: 'Número de telefone do usuário (com DDD, apenas números)',
    required: true,
  })
  @IsNotEmpty({ message: 'O número de telefone é obrigatório.' })
  @IsString({ message: 'O telefone deve ser uma string.' })
  // Você pode adicionar um IsMobilePhone() aqui se quiser uma validação rigorosa
  phone: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha de acesso do usuário',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;
}