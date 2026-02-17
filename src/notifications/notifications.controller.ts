import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport'; // <--- Usando o Guard padrão do Passport

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt')) // <--- "jwt" deve bater com o nome na sua Strategy
  @Get()
  @ApiOperation({ summary: 'Lista os avisos do usuário logado' })
  async findAll(@Request() req) {
    // Note que na sua JwtStrategy o ID vem como userId
    const id = req.user.userId || req.user.id;

    return this.prisma.notification.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
  }
}