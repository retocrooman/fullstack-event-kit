import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.config';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: EnvConfig.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation failed';
        });
        return new Error(`Validation failed: ${messages.join('; ')}`);
      },
    }),
  );


  await app.listen(EnvConfig.port);
  console.log(`API Server is running on: http://localhost:${EnvConfig.port}`);
}
bootstrap();
