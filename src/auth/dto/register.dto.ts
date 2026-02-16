import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Daniel Silva', description: 'Nome completo do usuário' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'daniel@eufit.com.br', description: 'E-mail único' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha (mínimo 6 caracteres)' })
  @MinLength(6)
  password: string;
}