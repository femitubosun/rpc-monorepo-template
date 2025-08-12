import {
  type AppZodResponse,
  type KnownStatus,
  StatusDescriptions,
} from '../__defs__';

export class AppResponse {
  static get StatusCode() {
    return {
      Okay: 200,
      Created: 201,
      NoContent: 204,
      BadRequest: 400,
      Unauthorized: 401,
      Forbidden: 403,
      NotFound: 404,
      UnprocessableEntity: 422,
      InternalServerError: 500,
    };
  }

  static get Schema() {
    return {
      jsonStatusCode,
      json200,
      json201,
    };
  }

  static get Data() {
    return {};
  }
}

/**
 * ---------------------------------------------------------
 *  RESPONSE HELPERS
 *  -------------------------------------------------------
 */

function json200<Schema extends AppZodResponse>(
  schema: Schema
) {
  return jsonStatusCode(200, schema);
}

export function json201<Schema extends AppZodResponse>(
  schema: Schema
) {
  return jsonStatusCode(201, schema);
}

function jsonStatusCode<
  StatusCode extends KnownStatus,
  Schema extends AppZodResponse,
>(statusCode: StatusCode, schema: Schema) {
  return {
    [statusCode]: {
      content: {
        'application/json': {
          schema: schema,
        },
      },
      description: StatusDescriptions[statusCode],
    },
  };
}
