import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { createValidationErrorResponse } from "../validation-error-response.js";

export const validationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (errors) => {
    // TODO: Formatear error cuando en la validación hay nested objects
    const formattedErrors = errors.reduce(
      (result, error) => {
        result[error.property] = Object.values(error.constraints || {});
        return result;
      },
      {} as Record<string, string[]>
    );
    throw new BadRequestException(
      createValidationErrorResponse(formattedErrors)
    );
  },
});
