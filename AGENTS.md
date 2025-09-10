# Agent Guidelines for Axon Codebase

## Build, Lint, and Test Commands
- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`
- Run tests for a specific module: `pnpm test modules/[module-name]`
- Lint code: `pnpm lint`
- Fix linting: `pnpm check:fix`
- Type check: `pnpm check-types`

## Code Style Guidelines
- Use TypeScript with strict mode
- Prefer ES modules (`import/export`)
- Use Biome for formatting and linting
- Indent with 2 spaces
- Use single quotes
- Always use semicolons
- Naming conventions:
  - camelCase for variables and functions
  - PascalCase for types and classes
  - UPPER_SNAKE_CASE for constants

## Error Handling
- Use custom error classes from `@axon-ai/error`
- Prefer throwing typed errors
- Always include context in error messages
- Use `makeError()` in action handlers

## Imports and Modules
- Use absolute imports with `@` aliases
- Group imports: external libs, internal modules, local files
- Remove unused imports
- Prefer type imports with `import type`

## Action System
- Define actions in `__action__/`
- Implement actions in `module/src/actions/`
- Use `A()` and `G()` for action definitions
- Handle both sync and async actions

## Best Practices
- No `any` types (warnings in packages)
- Use Zod for runtime type validation
- Write module-specific tests
- Follow modular architecture