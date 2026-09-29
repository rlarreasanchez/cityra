export const VALIDATION_ERROR_MESSAGE =
  "Existen errores de validación. Por favor, revise los campos.";

export function createValidationErrorResponse(
  validationErrors: Record<string, string[]>
) {
  return {
    message: VALIDATION_ERROR_MESSAGE,
    validationErrors,
    error: "VALIDATION_FAILED",
  };
}
