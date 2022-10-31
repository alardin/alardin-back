import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { UndefinedToNullInterceptor } from './common/interceptors/undefined-to-null.interceptor';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const port = +process.env.PORT || 3030;
  console.log(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:27017/${process.env.MONGODB_DB}?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`);
  console.log(process.env.NODE_ENV)
  console.log(process.env.PORT)
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
                    level: process.env.NODE_ENV === 'PROD' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint(),
            winston.format.errors({stack: true})
          ),
        }),
      ],
    }),
  });

  app.use(passport.initialize())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.useGlobalInterceptors(new UndefinedToNullInterceptor());
  const config = new DocumentBuilder()
  .setTitle('Alardin')
  .setDescription('Alardin API description')
  .setVersion('1.0')
  .addTag('')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV == 'DEV') {
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port, '0.0.0.0',  async () => {
    console.log(`[*] listening on ${port}!`);
  });
}
// test
bootstrap();
