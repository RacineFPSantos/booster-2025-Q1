import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL do frontend Vite
    credentials: true,
  });

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se houver propriedades extras
      transform: true, // Transforma os tipos automaticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Backend rodando em http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
