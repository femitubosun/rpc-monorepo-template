import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
} from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';

export * from './module';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<RouteDef extends RouteConfig> =
  RouteHandler<RouteDef, AppBindings>;

type RouteResponse = RouteConfig['responses'][string];
type ExtractResponseConfig<T> = T extends infer U
  ? U extends { description: string }
    ? U
    : never
  : never;
type ResponseConfig = ExtractResponseConfig<RouteResponse>;

type Content = ResponseConfig['content'];
type DefinedContent = Exclude<Content, undefined>;
type ZodMediaTypeValue = DefinedContent extends Record<
  any,
  infer V
>
  ? V
  : never;

export type AppZodResponse = Exclude<
  ZodMediaTypeValue,
  undefined
>['schema'];

export const StatusDescriptions = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  422: 'Unprocessable Entity',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
} as const;

export type KnownStatus = keyof typeof StatusDescriptions;

// const handler: ModuleRouterHandler = {
//   login: {
//     user: def,
//   },
//   signup: def,
// };
//
