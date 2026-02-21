import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    description: 'Novo status do ticket (OPEN, IN_PROGRESS, RESOLVED, CLOSED)',
    enum: TicketStatus,
    example: TicketStatus.RESOLVED,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Texto explicando como o problema foi resolvido',
    example: 'Estorno realizado para a carteira do aluno e advertência aplicada ao profissional.',
  })
  @IsString()
  @IsOptional()
  resolution?: string;
}