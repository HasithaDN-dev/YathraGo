import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { LogRawBodyMiddleware } from './log-raw-body.middleware';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Log raw request body for /customer/register-child
  app.use(new LogRawBodyMiddleware().use.bind(new LogRawBodyMiddleware()));

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
