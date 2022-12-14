import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { json } from 'express';
import { AppModule } from './app.module';
import { UndefinedToNullInterceptor } from './common/interceptors/undefined-to-null.interceptor';

async function bootstrap() {
  const port = +process.env.PORT || 3030;
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint(),
            winston.format.errors({ stack: true }),
          ),
        }),
      ],
    }),
  });
  app.use(json({ limit: '10mb' }));
  app.use(passport.initialize());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new UndefinedToNullInterceptor());
  const config = new DocumentBuilder()
    .setTitle('Alardin')
    .setDescription('Alardin API description')
    .setVersion('1.0')
    .addTag('')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV === 'development') {
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port, '0.0.0.0', async () => {
    Logger.log(`[*] listening on ${port}!`);
  });
}
// test
bootstrap();
