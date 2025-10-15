import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { LogRawBodyMiddleware } from './log-raw-body.middleware';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Log raw request body for /customer/register-child
  app.use(new LogRawBodyMiddleware().use.bind(new LogRawBodyMiddleware()));

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS for mobile app development
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((e) => ({
            field: e.property,
            errors: Object.values(e.constraints ?? {}),
          })),
        );
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
