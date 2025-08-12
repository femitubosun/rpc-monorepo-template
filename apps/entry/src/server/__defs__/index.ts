import type {
  OpenAPIHono,
  RouteConfig,
} from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

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
  // biome-ignore lint/suspicious/noExplicitAny: Required for generic type extraction
  any,
  infer V
>
  ? V
  : never;
export type AppZodResponse = Exclude<
  ZodMediaTypeValue,
  undefined
>['schema'];
