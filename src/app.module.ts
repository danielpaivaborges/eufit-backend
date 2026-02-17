import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Carrega o .env
    ConfigModule.forRoot({ isGlobal: true }),
    // Conecta no Banco
    PrismaModule,
    // Módulo de Autenticação (Login/Cadastro)
    AuthModule,
    // OBS: O UsersModule foi removido para não conflitar
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}