import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // Executado assim que o módulo inicia
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    }
  }

  // Executado quando o container/processo é finalizado
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Conexão com o PostgreSQL encerrada.');
  }
}