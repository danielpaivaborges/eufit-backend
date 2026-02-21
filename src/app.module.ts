import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TicketsModule } from './tickets/tickets.module'; // <--- Importe o novo módulo de Tickets

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    NotificationsModule,
    TicketsModule, // <--- Adicione aqui nos imports
  ],
  controllers: [], // <--- DEIXE VAZIO (O controller agora está no módulo dele)
  providers: [],
})
export class AppModule {}