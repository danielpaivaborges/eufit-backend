import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
// Remova: import { UsersModule } ...
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Remova: UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}