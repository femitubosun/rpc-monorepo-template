import { createRoute } from '@hono/zod-openapi';
import type { ZodSchema } from 'zod';

/**
 * ------------------------------------------
 *  To be reworked
 * ------------------------------------------
 */

export function makeRoute<T extends Parameters<typeof createRoute>[0]>(
  config: T
) {
  return createRoute(config);
}

// Flexible route helpers - create routes with different combinations
type RouteOptions<TMethod extends string, TPath extends string> = {
  method: TMethod;
  path: TPath;
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
  response?: {
    schema: ZodSchema;
    statusCode?: number;
    description?: string;
  };
};

export function createFlexibleRoute<
  TMethod extends 'get' | 'post' | 'put' | 'patch' | 'delete',
  TPath extends string,
>(options: RouteOptions<TMethod, TPath>) {
  const { method, path, params, body, query, response } = options;

  // Build request object
  const request: any = {};
  if (params) request.params = params;
  if (body) {
    request.body = {
      content: {
        'application/json': {
          schema: body,
        },
      },
    };
  }
  if (query) request.query = query;

  // Build responses object
  const responses: any = {};
  if (response) {
    const { schema, statusCode = 200, description = 'Success' } = response;
    responses[statusCode] = {
      description,
    };

    // Only add content if schema is provided
    if (schema) {
      responses[statusCode].content = {
        'application/json': {
          schema,
        },
      };
    }
  }

  // Build final config
  const config: any = { method, path };
  if (Object.keys(request).length > 0) config.request = request;
  if (Object.keys(responses).length > 0) config.responses = responses;

  return createRoute(config);
}

// Convenience functions for common patterns
export function getRoute<TPath extends string>(
  path: TPath,
  options: {
    params?: ZodSchema;
    query?: ZodSchema;
    response?: {
      schema: ZodSchema;
      statusCode?: number;
      description?: string;
    };
  } = {}
) {
  return createFlexibleRoute({
    method: 'get',
    path,
    ...options,
  });
}

export function postRoute<TPath extends string>(
  path: TPath,
  options: {
    params?: ZodSchema;
    body?: ZodSchema;
    response?: {
      schema: ZodSchema;
      statusCode?: number;
      description?: string;
    };
  } = {}
) {
  return createFlexibleRoute({
    method: 'post',
    path,
    ...options,
  });
}

export function putRoute<TPath extends string>(
  path: TPath,
  options: {
    params?: ZodSchema;
    body?: ZodSchema;
    response?: {
      schema: ZodSchema;
      statusCode?: number;
      description?: string;
    };
  } = {}
) {
  return createFlexibleRoute({
    method: 'put',
    path,
    ...options,
  });
}

export function deleteRoute<TPath extends string>(
  path: TPath,
  options: {
    params?: ZodSchema;
    response?: {
      schema?: ZodSchema;
      statusCode?: number;
      description?: string;
    };
  } = {}
) {
  // For DELETE routes, we often don't need a response schema
  const routeOptions: RouteOptions<'delete', TPath> = {
    method: 'delete',
    path,
    params: options.params,
  };

  // Only add response if schema is provided
  if (options.response?.schema) {
    routeOptions.response = {
      schema: options.response.schema,
      statusCode: options.response.statusCode,
      description: options.response.description,
    };
  }

  return createFlexibleRoute(routeOptions);
}
