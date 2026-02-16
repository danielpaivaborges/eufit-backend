import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Validação Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('EUFIT V2 Ecosystem')
    .setDescription('API da plataforma de gestão de franquias e treinos.')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // AQUI É O PULO DO GATO: O primeiro argumento define a URL
  // Se estiver 'api', a url será /api
  SwaggerModule.setup('api', app, document); 

  app.enableCors();
  await app.listen(3000);
}
bootstrap();