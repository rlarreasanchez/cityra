import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";

import { InvalidCredentialsError } from "../../domain/errors/invalid-credentials.error.js";
import { SessionUserNotFoundError } from "../../domain/errors/session-user-not-found.error.js";
import { UserInactiveError } from "../../domain/errors/user-inactive.error.js";

const INVALID_CREDENTIALS_MESSAGE = "El email o la contraseña son incorrectos";
const SESSION_INVALID_MESSAGE = "La sesión no es válida";
const USER_INACTIVE_MESSAGE =
  "Tu usuario no está activo. Por favor, ponte en contacto con el administrador.";

@Catch(InvalidCredentialsError, SessionUserNotFoundError, UserInactiveError)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      InvalidCredentialsError | SessionUserNotFoundError | UserInactiveError,
    host: ArgumentsHost
  ): void {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof SessionUserNotFoundError) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        message: SESSION_INVALID_MESSAGE,
        error: "SESSION_INVALID",
      });
      return;
    }

    if (exception instanceof UserInactiveError) {
      response.status(HttpStatus.FORBIDDEN).json({
        message: USER_INACTIVE_MESSAGE,
        error: "USER_INACTIVE",
      });
      return;
    }

    response.status(HttpStatus.UNAUTHORIZED).json({
      message: INVALID_CREDENTIALS_MESSAGE,
      error: "INVALID_CREDENTIALS",
    });
  }
}
