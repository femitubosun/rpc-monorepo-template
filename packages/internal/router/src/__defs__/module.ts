import type { RouteConfig } from '@hono/zod-openapi';
import type { AppRouteHandler } from '.';

export type ModuleRouterDefinition = {
  [key: string]: RouteConfig | ModuleRouterDefinition;
};

export type ModuleRouterHandler<T extends Record<string, any>> = Partial<{
  [K in keyof T]: T[K] extends RouteConfig
    ? // @ts-ignore
      AppRouteHandler<T[K]>
    : T[K] extends Record<string, any>
      ? ModuleRouterHandler<T[K]>
      : AppRouteHandler<any>;
}>;
