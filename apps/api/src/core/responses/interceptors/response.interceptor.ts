import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AppConfigService } from "@config/app-config.service.js";

export class ResponseFormat<T> {
  isArray: boolean;
  path: string;
  duration: string;
  method: string;

  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  constructor(private readonly config: AppConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ResponseFormat<T>> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        isArray: Array.isArray(data),
        quantity: Array.isArray(data) ? data.length : 1,
        path: request.path,
        duration: `${Date.now() - now}ms`,
        method: request.method,
      }))
    );
  }
}
