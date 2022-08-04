import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>();
        console.log(exception)
        console.log(exception.cause)
        const errStatus = exception.getStatus(), errMessage = exception.message;
        return response.status(errStatus).json({ status: 'FAIL', data: errMessage });
    }
}