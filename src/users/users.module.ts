import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// O PrismaModule é Global, mas não faz mal importar (ou deixar sem se for global)
// Vamos importar só para garantir

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para o AuthModule usar depois
})
export class UsersModule {}