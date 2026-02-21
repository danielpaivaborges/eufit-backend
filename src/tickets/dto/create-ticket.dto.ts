import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TicketType } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Título ou resumo do problema',
    example: 'Profissional não compareceu',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do que aconteceu',
    example: 'Fiquei esperando 30 minutos na academia e ele não apareceu e não atendeu o celular.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Tipo do ticket (SUPPORT, DISPUTE ou REPORT)',
    enum: TicketType,
    example: TicketType.DISPUTE,
  })
  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @ApiPropertyOptional({
    description: 'Cidade onde ocorreu o problema (Para cair no dashboard do Franqueado)',
    example: 'Belo Horizonte',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF) onde ocorreu o problema',
    example: 'MG',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que está sendo denunciado/reportado (Opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  reportedId?: string;

  @ApiPropertyOptional({
    description: 'ID do agendamento relacionado ao problema (Opcional)',
    example: '987fcdeb-51a2-43d7-9012-426614174000',
  })
  @IsUUID()
  @IsOptional()
  bookingId?: string;
}