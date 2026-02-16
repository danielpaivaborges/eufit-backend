import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Necessário para ler o .env do Docker
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // IsGlobal faz com que o .env fique disponível em todo o projeto sem importar de novo
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}