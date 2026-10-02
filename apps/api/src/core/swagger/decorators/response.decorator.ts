import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from "@nestjs/swagger";

import { ResponseFormat } from "@core/responses/interceptors/response.interceptor.js";

const buildResponseSchema = <TModel extends Type<unknown>>(
  model: TModel,
  isArray: boolean
) => ({
  allOf: [
    { $ref: getSchemaPath(ResponseFormat) },
    {
      properties: {
        data: isArray
          ? { type: "array", items: { $ref: getSchemaPath(model) } }
          : { $ref: getSchemaPath(model) },
        isArray: {
          type: "boolean",
          default: isArray,
        },
        quantity: {
          type: "number",
          default: 1,
        },
      },
    },
  ],
});

export const ApiResponseType = <TModel extends Type<unknown>>(
  model: TModel,
  isArray: boolean
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      isArray: isArray,
      schema: buildResponseSchema(model, isArray),
    })
  );
};

export const ApiCreatedResponseType = <TModel extends Type<unknown>>(
  model: TModel,
  isArray: boolean
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      isArray: isArray,
      schema: buildResponseSchema(model, isArray),
    })
  );
};

export const ApiUpdatedResponseType = <TModel extends Type<unknown>>(
  model: TModel,
  isArray: boolean
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      isArray: isArray,
      schema: buildResponseSchema(model, isArray),
    })
  );
};

export const ApiDeletedResponseType = (description: string) => {
  return applyDecorators(ApiOkResponse({ description }));
};
