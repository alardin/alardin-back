import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { UndefinedToNullInterceptor } from './common/interceptors/undefined-to-null.interceptor';

async function bootstrap() {
  const port = +process.env.PORT || 3030;
  const app = await NestFactory.create(AppModule);

  app.use(passport.initialize())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    disableErrorMessages: true
  }));
  app.useGlobalInterceptors(new UndefinedToNullInterceptor());
  const config = new DocumentBuilder()
  .setTitle('Alardin')
  .setDescription('Alardin API description')
  .setVersion('1.0')
  .addTag('')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0',  () => {
    console.log(`listening on ${port}`);
  });
}
bootstrap();
