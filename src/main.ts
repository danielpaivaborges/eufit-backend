import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilita CORS para o seu App Mobile conectar
  app.enableCors();

  // 2. Ativa as validações dos DTOs (@IsNotEmpty, etc)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 3. Configura o Swagger (Acessível em /api)
  const config = new DocumentBuilder()
    .setTitle('EUFIT API')
    .setDescription('Documentação do Ecossistema Fitness EUFIT')
    .setVersion('1.0')
    .addBearerAuth() // Permite testar rotas protegidas com Token
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 4. Porta que o Docker espera (3000 interna -> 80 externa)
  await app.listen(3000);
}
bootstrap();