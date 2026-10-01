import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";

import { ApiProperty } from "@nestjs/swagger";
import type { Request, Response } from "express";

import { AppConfigService } from "@config/app-config.service.js";
import { LoggerService } from "@core/logger/logger.service.js";
import { VALIDATION_ERROR_MESSAGE } from "../validation-error-response.js";

export class ExceptionFormat {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: "2021-09-09T12:00:00.000Z" })
  timestamp: string;

  @ApiProperty({ example: "/api/v1/hello" })
  path: string;

  @ApiProperty({
    example: {
      email: ["email must be an email"],
      username: ["Username is required"],
    },
  })
  validationErrors?: Record<string, string[]>;

  @ApiProperty({
    example: "An internal server error occurred, please try again later",
  })
  message: string;

  @ApiProperty({ example: "INVALID_EMAIL" })
  errorToken?: string | string[];

  @ApiProperty({ required: false })
  stack?: string;
}

interface HttpExceptionBody {
  message?: string | string[];
  error?: string | string[];
  validationErrors?: Record<string, string[]>;
}

interface ResolvedException {
  status: HttpStatus;
  message: string;
  errorToken?: string | string[];
  validationErrors: Record<string, string[]> | null;
}

interface DomainErrorResponse {
  status: HttpStatus;
  message: string;
  errorToken: string;
  validationErrors?: Record<string, string[]>;
}

// Errores de dominio (features/auth y features/users) identificados por `error.name`
// para que este filtro global no dependa directamente de las capas de features.
const DOMAIN_ERROR_RESPONSES: Record<string, DomainErrorResponse> = {
  InvalidCredentialsError: {
    status: HttpStatus.UNAUTHORIZED,
    message: "El email o la contraseña son incorrectos",
    errorToken: "INVALID_CREDENTIALS",
  },
  SessionUserNotFoundError: {
    status: HttpStatus.UNAUTHORIZED,
    message: "La sesión no es válida",
    errorToken: "SESSION_INVALID",
  },
  UserInactiveError: {
    status: HttpStatus.FORBIDDEN,
    message:
      "Tu usuario no está activo. Por favor, ponte en contacto con el administrador.",
    errorToken: "USER_INACTIVE",
  },
  UserNotFoundError: {
    status: HttpStatus.NOT_FOUND,
    message: "El usuario no existe",
    errorToken: "USER_NOT_FOUND",
  },
  EmailAlreadyExistsError: {
    status: HttpStatus.BAD_REQUEST,
    message: VALIDATION_ERROR_MESSAGE,
    errorToken: "VALIDATION_FAILED",
    validationErrors: { email: ["El email ya está registrado"] },
  },
  ForbiddenError: {
    status: HttpStatus.FORBIDDEN,
    message: "Acceso denegado",
    errorToken: "FORBIDDEN",
  },
};

function resolveHttpExceptionBody(
  responseBody: string | object
): Omit<ResolvedException, "status"> {
  if (typeof responseBody === "string") {
    return {
      message: responseBody,
      errorToken: undefined,
      validationErrors: null,
    };
  }

  const body = responseBody as HttpExceptionBody;
  const message = Array.isArray(body.message)
    ? body.message.join(", ")
    : body.message;

  return {
    message: message ?? "Error inesperado",
    errorToken: body.error,
    validationErrors: body.validationErrors ?? null,
  };
}

function resolveException(exception: unknown): ResolvedException {
  if (exception instanceof HttpException) {
    return {
      status: exception.getStatus(),
      ...resolveHttpExceptionBody(exception.getResponse()),
    };
  }

  if (exception instanceof Error) {
    const domainResponse = DOMAIN_ERROR_RESPONSES[exception.name];
    if (domainResponse) {
      return {
        status: domainResponse.status,
        message: domainResponse.message,
        errorToken: domainResponse.errorToken,
        validationErrors: domainResponse.validationErrors ?? null,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        exception.message ||
        "An internal server error occurred, please try again later",
      errorToken: undefined,
      validationErrors: null,
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "An internal server error occurred, please try again later",
    errorToken: undefined,
    validationErrors: null,
  };
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: AppConfigService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errorToken, validationErrors } =
      resolveException(exception);
    const isProduction = this.config.get("env") === "production";

    const responseData: ExceptionFormat = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      validationErrors: validationErrors ?? undefined,
      message:
        status >= HttpStatus.INTERNAL_SERVER_ERROR && isProduction
          ? "An internal server error occurred, please try again later"
          : message,
      errorToken,
      // NUNCA exponer stack trace en producción
      ...(!isProduction && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    };

    this.logMessage(
      request,
      message,
      errorToken,
      status,
      exception,
      validationErrors
    );

    response.status(status).json(responseData);
  }

  private logMessage(
    request: Request,
    errorMessage: string,
    errorToken: string | string[] | undefined,
    status: number,
    exception: unknown,
    validationErrors: Record<string, string[]> | null
  ): void {
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Log completo del error en servidor (no al cliente)
      this.logger.error(
        `End Request for ${request.url}`,
        `method=${request.method} status=${status} errorToken=${
          errorToken ? errorToken : null
        } message=${errorMessage ? errorMessage : null}`,
        exception instanceof Error ? exception.stack : undefined
      );
    } else {
      this.logger.warn(
        `End Request for ${request.url}`,
        `method=${request.method} status=${status} ${request.query ? `query=${JSON.stringify(request.query)}` : ""}
          ${request.body ? `body=${JSON.stringify(request.body)}` : ""} errorToken='${
            errorToken ? errorToken : null
          }' message='${errorMessage ? errorMessage : null}' ${
            validationErrors
              ? `validationErrors=${JSON.stringify(validationErrors)}`
              : ""
          }`
      );
    }
  }
}
