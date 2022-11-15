import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Client } from '@notionhq/client';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const errStatus = exception.getStatus(),
      errMessage = exception.message;

    if (errStatus != 404) {
      const notion = new Client({
        auth: process.env.NOTION_KEY,
      });
      const databaseId = process.env.NOTION_EXCEPTION_DB_ID;
      const environment =
        process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD';
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: `${environment}_${new Date().toString()}`,
                },
              },
            ],
          },
          Tags: {
            type: 'multi_select',
            multi_select: [
              {
                name: String(errStatus),
              },
            ],
          },
          Message: {
            type: 'rich_text',
            rich_text: [
              {
                text: {
                  content: String(exception.stack).replace('\\n', '\n'),
                },
              },
            ],
          },
        },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log(exception.stack);
    return response
      .status(errStatus)
      .json({ status: 'FAIL', data: errMessage });
  }
}
