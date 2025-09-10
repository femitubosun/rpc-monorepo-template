function isRouteConfig(value: any): boolean {
  return (
    value && typeof value === 'object' && 'method' in value && 'path' in value
  );
}

export class Module {
  static registerRoutes<T extends Record<string, any>>(
    router: any,
    routes: T,
    handlers: Partial<{ [K in keyof T]: any }>
  ) {
    for (const [key, route] of Object.entries(routes)) {
      const handler = handlers[key as keyof typeof handlers];

      if (isRouteConfig(route)) {
        // Direct route - register with handler
        if (handler) {
          router.openapi(route, handler);
        }
      } else if (route && typeof route === 'object' && !Array.isArray(route)) {
        // Nested router - recursively register if handler exists
        if (handler && typeof handler === 'object') {
          Module.registerRoutes(
            router,
            route as Record<string, any>,
            handler as Record<string, any>
          );
        }
      }
    }
  }
}
