/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos da pasta public/
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

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

  console.log('🌐 CORS - Allowed Origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (Postman, mobile apps, etc)
      if (!origin) {
        console.log('✅ CORS - Permitindo requisição sem origin');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        //console.log(`✅ CORS - Permitindo origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`🚫 CORS - Origem bloqueada: ${origin}`);
        // Retorna false em vez de erro para não quebrar a requisição
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Erro fatal ao iniciar aplicação:', error);
  process.exit(1);
});
