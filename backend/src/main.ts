import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Chat attachments (images/voice notes) — saved to disk by ChatUploadController,
  // served back from here. Registered before setGlobalPrefix so /uploads/* isn't
  // prefixed with /api.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(compression());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const ALWAYS_ALLOWED = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const rawOrigins = configService.get<string>('FRONTEND_URL') ?? '';
  const envOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  const allowedOrigins = new Set([...ALWAYS_ALLOWED, ...envOrigins]);

  console.log('[CORS] Allowed origins:', [...allowedOrigins]);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
  });

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`[Fulltime API] Running on http://localhost:${port}/api/v1`);
}

bootstrap();
