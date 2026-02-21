import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TicketsModule } from './tickets/tickets.module'; 
import { UsersModule } from './users/users.module'; // <--- Importando a gestão de usuários

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    NotificationsModule,
    TicketsModule,
    UsersModule, // <--- Registrando o motor de análise da Éveros Fit
  ],
  controllers: [], 
  providers: [],
})
export class AppModule {}