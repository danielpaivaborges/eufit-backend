import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt')) // O NestJS vai procurar pela 'JwtStrategy' registrada
  @Get()
  @ApiOperation({ summary: 'Lista os avisos do usuário logado' })
  async findAll(@Request() req) {
    // Pegando o ID do payload que vem da sua JwtStrategy
    const userId = req.user.userId; 

    return this.prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}