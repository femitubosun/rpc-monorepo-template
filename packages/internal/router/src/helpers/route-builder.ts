/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodContentObject } from '@asteasolutions/zod-to-openapi';
import {
  type RouteConfig as BaseRouteConfig,
  createRoute,
} from '@hono/zod-openapi';
import type { MiddlewareHandler } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import type { ZodType } from 'zod';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

class RouteBuilder<T extends Partial<BaseRouteConfig> = {}> {
  private readonly config: T;

  constructor(config: T = {} as T) {
    this.config = config;
  }

  path<P extends string>(path: P): RouteBuilder<T & { path: P }> {
    this.config.path = path;

    return this as unknown as RouteBuilder<T & { path: P }>;
  }

  method<M extends Method>(method: M): RouteBuilder<T & { method: M }> {
    this.config.method = method;

    return this as unknown as RouteBuilder<T & { method: M }>;
  }

  summary(summary: string): RouteBuilder<T & { summary: string }> {
    this.config.summary = summary;
    return this as unknown as RouteBuilder<T & { summary: string }>;
  }

  description(description: string): RouteBuilder<T & { description: string }> {
    this.config.description = description;

    return this as unknown as RouteBuilder<T & { description: string }>;
  }

  tags(tags: string[]): RouteBuilder<T & { tags: string[] }> {
    this.config.tags = tags;
    return this as unknown as RouteBuilder<T & { tags: string[] }>;
  }

  params<P extends ZodType>(
    params: P
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        params: P;
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      params: params as any,
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & { params: P };
      }
    >;
  }

  query<Q extends ZodType>(
    query: Q
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        query: Q;
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      query: query as any,
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & { query: Q };
      }
    >;
  }

  headers<H extends ZodType | ZodType[]>(
    headers: H
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        headers: H;
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      headers: headers as any,
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & { headers: H };
      }
    >;
  }

  cookies<C extends ZodType>(
    cookies: C
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        cookies: C;
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      cookies: cookies as any,
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & { cookies: C };
      }
    >;
  }

  // Body with different content types
  jsonBody<S extends ZodType>(
    schema: S
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        body: {
          content: {
            'application/json': {
              schema: S;
            };
          };
          required: true;
        };
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      body: {
        content: {
          'application/json': {
            schema,
          },
        },
        required: true,
      },
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & {
          body: {
            content: {
              'application/json': {
                schema: S;
              };
            };
            required: true;
          };
        };
      }
    >;
  }

  formBody<S extends ZodType>(
    schema: S
  ): RouteBuilder<
    T & {
      request: (T extends { request: infer R } ? R : {}) & {
        body: {
          content: {
            'application/x-www-form-urlencoded': {
              schema: S;
            };
          };
          required: true;
        };
      };
    }
  > {
    this.config.request = {
      ...this.config.request,
      body: {
        content: {
          'application/x-www-form-urlencoded': {
            schema,
          },
        },
        required: true,
      },
    };

    return this as unknown as RouteBuilder<
      T & {
        request: (T extends { request: infer R } ? R : {}) & {
          body: {
            content: {
              'application/x-www-form-urlencoded': {
                schema: S;
              };
            };
            required: true;
          };
        };
      }
    >;
  }

  // Response types
  response<Status extends StatusCode, Content extends ZodContentObject>(
    status: Status,
    description: string,
    content?: Content
  ): RouteBuilder<
    T & {
      responses: (T extends { responses: infer R } ? R : {}) & {
        [K in Status]: {
          description: string;
          content: Content;
        };
      };
    }
  > {
    (this.config as any).responses = {
      ...this.config.responses,
      [status]: {
        description,
        content,
      },
    };

    return this as unknown as RouteBuilder<
      T & {
        responses: (T extends { responses: infer R } ? R : {}) & {
          [K in Status]: {
            description: string;
            content: Content;
          };
        };
      }
    >;
  }

  jsonResponse<Status extends StatusCode, S extends ZodType>(
    status: Status,
    description: string,
    schema: S
  ): RouteBuilder<
    T & {
      responses: (T extends { responses: infer R } ? R : {}) & {
        [K in Status]: {
          description: string;
          content: {
            'application/json': {
              schema: S;
            };
          };
        };
      };
    }
  > {
    return this.response(status, description, {
      'application/json': {
        schema,
      },
    });
  }

  // Middleware
  middleware<M extends MiddlewareHandler | MiddlewareHandler[]>(
    middleware: M
  ): RouteBuilder<T & { middleware: M }> {
    this.config.middleware = middleware;
    return this as unknown as RouteBuilder<T & { middleware: M }>;
  }

  // Hide from documentation
  hide(hide: boolean = true): RouteBuilder<T & { hide: boolean }> {
    this.config.hide = hide;
    return this as unknown as RouteBuilder<T & { hide: boolean }>;
  }

  // Build the final route
  build(): T extends { path: string; method: string } ? T : never {
    if (!this.config.path || !this.config.method) {
      throw new Error('Route must have both path and method defined');
    }
    return createRoute(this.config as any);
  }
}

// Static methods for each HTTP method
export class Route {
  static get<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'get' }> {
    return new RouteBuilder({ path, method: 'get' });
  }

  static post<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'post' }> {
    return new RouteBuilder({ path, method: 'post' });
  }

  static put<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'put' }> {
    return new RouteBuilder({ path, method: 'put' });
  }

  static delete<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'delete' }> {
    return new RouteBuilder({ path, method: 'delete' });
  }

  static patch<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'patch' }> {
    return new RouteBuilder({ path, method: 'patch' });
  }

  static head<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'head' }> {
    return new RouteBuilder({ path, method: 'head' });
  }

  static options<P extends string>(
    path: P
  ): RouteBuilder<{ path: P; method: 'options' }> {
    return new RouteBuilder({ path, method: 'options' });
  }
}
