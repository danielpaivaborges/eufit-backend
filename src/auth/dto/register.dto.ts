import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO responsável por validar os dados de criação de um novo usuário.
 */
export class RegisterDto {
  @ApiProperty({
    example: 'Daniel Silva',
    description: 'Nome completo do usuário',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '5531999999999',
    description: 'Número de telefone único para cadastro e login',
  })
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: 'contato@eufit.com.br',
    description: 'E-mail do usuário (opcional no cadastro inicial)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'O formato do e-mail é inválido.' })
  email?: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha de acesso (mínimo 6 caracteres)',
  })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ser mais forte (mínimo 6 caracteres).' })
  password: string;
}