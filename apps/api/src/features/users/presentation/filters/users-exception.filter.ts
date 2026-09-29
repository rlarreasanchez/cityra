import { createValidationErrorResponse } from "@core/exceptions/validation-error-response.js";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { EmailAlreadyExistsError } from "../../domain/errors/email-already-exists.error.js";
import { UserNotFoundError } from "../../domain/errors/user-not-found.error.js";

const EMAIL_ALREADY_EXISTS_MESSAGE = "El email ya está registrado";
const USER_NOT_FOUND_MESSAGE = "El usuario no existe";

@Catch(EmailAlreadyExistsError, UserNotFoundError)
export class UsersExceptionFilter implements ExceptionFilter {
  catch(
    exception: EmailAlreadyExistsError | UserNotFoundError,
    host: ArgumentsHost
  ): void {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof UserNotFoundError) {
      response.status(HttpStatus.NOT_FOUND).json({
        message: USER_NOT_FOUND_MESSAGE,
        error: "USER_NOT_FOUND",
      });
      return;
    }

    response
      .status(HttpStatus.BAD_REQUEST)
      .json(
        createValidationErrorResponse({ email: [EMAIL_ALREADY_EXISTS_MESSAGE] })
      );
  }
}
