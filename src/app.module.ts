import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module'; // <--- Importe o novo módulo

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    NotificationsModule, // <--- Adicione aqui nos imports
  ],
  controllers: [], // <--- DEIXE VAZIO (O controller agora está no módulo dele)
  providers: [],
})
export class AppModule {}