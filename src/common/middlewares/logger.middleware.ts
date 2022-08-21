import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleWare implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction) {
        const { method, originalUrl } = request;
        const { statusCode } = response;
        const realIp = request.headers['x-real-ip']
        response.on('finish', () => {
            this.logger.log(`${method} ${originalUrl} From ${realIp} - ${statusCode}`);
        });
        
        next();
    }
}