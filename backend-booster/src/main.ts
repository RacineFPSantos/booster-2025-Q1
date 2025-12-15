/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Swagger Configuração
  const config = new DocumentBuilder()
    .setTitle('AI Car')
    .setDescription('API do Projeto AI Car')
    .setVersion('1.0')
    .addTag('AIcar')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Habilitar CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173', // Desenvolvimento local
    'https://booster2025-aicar.web.app', // Firebase Hosting
    'https://booster2025-aicar.firebaseapp.com', // Firebase Hosting alternativo
  ].filter(Boolean); // Remove valores undefined/null

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (Postman, mobile apps, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Origem bloqueada por CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Backend rodando em http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
