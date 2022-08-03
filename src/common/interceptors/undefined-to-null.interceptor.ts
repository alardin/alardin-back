import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export interface Response<T> {
    status: 'SUCCESS',
    data: T;
}

@Injectable()
export class UndefinedToNullInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<Response<T>> | Promise<Observable<Response<T>>> {
        return next.handle().pipe(map(data => (
            data === undefined ? { status: 'SUCCESS', data: null } : { status: 'SUCCESS', data }
        )));
    }
}