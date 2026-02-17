import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // <--- Aqui o segredo: Importamos o AuthModule para ele conhecer o "jwt"
  controllers: [NotificationsController],
})
export class NotificationsModule {}