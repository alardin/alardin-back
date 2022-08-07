import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable, tap } from "rxjs";

@Injectable()
export class AgoraInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const response: Response = context.switchToHttp().getResponse();
        response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        response.header('Expires', '-1');
        response.header('Pragma', 'no-cache');
        
        return next.handle();
    }
    
}