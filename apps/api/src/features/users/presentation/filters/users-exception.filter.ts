import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { createValidationErrorResponse } from "@core/exceptions/validation-error-response.js";
import { EmailAlreadyExistsError } from "../../domain/errors/email-already-exists.error.js";

const EMAIL_ALREADY_EXISTS_MESSAGE = "El email ya está registrado";

@Catch(EmailAlreadyExistsError)
export class UsersExceptionFilter implements ExceptionFilter {
  catch(exception: EmailAlreadyExistsError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    response
      .status(HttpStatus.BAD_REQUEST)
      .json(
        createValidationErrorResponse({ email: [EMAIL_ALREADY_EXISTS_MESSAGE] })
      );
  }
}
