import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { LoggerService } from "@core/logger/logger.service.js";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const ip = this.getIP(request);

    this.logger.debug(
      `Incoming Request on ${request.url}`,
      `method=${request.method} ip=${ip} query=${JSON.stringify(request.query)}
      ${request.body ? `body=${JSON.stringify(request.body)}` : ""}`
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.debug(
          `End Request for ${request.url}`,
          `method=${request.method} ip=${ip} duration=${Date.now() - now}ms`
        );
      })
    );
  }

  private getIP(request: {
    headers: Record<string, string | string[] | undefined>;
    socket: { remoteAddress?: string };
  }): string {
    const forwardedFor = request.headers["x-forwarded-for"];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[forwardedFor.length - 1]
      : forwardedFor?.split(",").pop()?.trim();

    return (ip ?? request.socket.remoteAddress ?? "").replace("::ffff:", "");
  }
}
