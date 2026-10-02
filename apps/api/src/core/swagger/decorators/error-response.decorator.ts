import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { VALIDATION_ERROR_MESSAGE } from "@core/exceptions/validation-error-response.js";

const buildErrorSchema = (
  statusCode: number,
  message: string,
  errorToken: string,
  validationErrors: Record<string, string[]> | null = null
) => ({
  type: "object",
  properties: {
    statusCode: { type: "number", example: statusCode },
    timestamp: { type: "string", example: "2021-09-09T12:00:00.000Z" },
    path: { type: "string", example: "/api/v1/hello" },
    message: { type: "string", example: message },
    errorToken: { type: "string", example: errorToken },
    validationErrors: {
      type: "object",
      nullable: true,
      example: validationErrors,
    },
  },
});

export const ApiValidationErrorResponse = (options: {
  description: string;
  validationErrors: Record<string, string[]>;
}) => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: options.description,
      schema: buildErrorSchema(
        400,
        VALIDATION_ERROR_MESSAGE,
        "VALIDATION_FAILED",
        options.validationErrors
      ),
    })
  );
};

export const ApiUnauthorizedErrorResponse = (options: {
  description: string;
  errorToken: string;
}) => {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: options.description,
      schema: buildErrorSchema(401, options.description, options.errorToken),
    })
  );
};

export const ApiForbiddenErrorResponse = (options: {
  description: string;
  errorToken: string;
}) => {
  return applyDecorators(
    ApiForbiddenResponse({
      description: options.description,
      schema: buildErrorSchema(403, options.description, options.errorToken),
    })
  );
};

export const ApiNotFoundErrorResponse = (options: {
  description: string;
  errorToken: string;
}) => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: options.description,
      schema: buildErrorSchema(404, options.description, options.errorToken),
    })
  );
};
