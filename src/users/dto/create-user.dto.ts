import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Daniel Silva' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '5531999999999' })
  @IsNotEmpty() // Agora é obrigatório!
  @IsString()
  phone: string;

  @ApiProperty({ example: 'daniel@email.com', required: false })
  @IsOptional() // Email continua opcional conforme sua regra nova
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'senha123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}