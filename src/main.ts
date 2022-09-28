import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { UndefinedToNullInterceptor } from './common/interceptors/undefined-to-null.interceptor';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { Client } from "@notionhq/client";

async function updateNotion(status: string, message?: string) {
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const databaseId = process.env.NOTION_SERVER_DB_ID;

  const now = new Date();
  let years = now.getFullYear();
  let months: string | number = now.getMonth()+1;
  let date = now.getDate();
  let hours: string | number = now.getHours();
  let minutes: string | number = now.getMinutes();
  months = months <= 9 ? `0${months}` : months;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  hours = hours < 10 ?  `0${hours}` : hours;
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        type: 'title',
        title: [{
            type: 'text',
            text: {
                content: `check_${months}/${date}/${years} ${hours}:${minutes}`
            }
        }]
      },
      Tags: {
          type: 'multi_select',
          multi_select: [
              {
                  name: status === "ALIVE" ? status : "DEAD",
                  color: status === "ALIVE" ? 'green' : 'red'
              }
          ]
      },
      Message: {
        type: 'rich_text',
        rich_text: [
            {
                text: {
                    content: message
                },
            }
        ]
      },
      Mention: {
        type: 'rich_text',
        rich_text: [
            status === "ALIVE" ? 
            {
              text: {
                content: ''
              }
            } : {
                mention: {
                    user: {
                        id: process.env.NOTION_USER_ID,
                        person: {
                            email: process.env.EMAIL
                        }
                    }
                }
            }
        ]
      }
    }
  });
}


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
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0',  async () => {
    console.log(`[*] listening on ${port}!`);
    await updateNotion("ALIVE", "SUCCESS");
  }).catch(async e => { await updateNotion('DEAD', e.message) });
}
// test
bootstrap();
