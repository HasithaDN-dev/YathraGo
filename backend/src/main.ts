import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for mobile development
  app.enableCors({
    origin: true, // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
