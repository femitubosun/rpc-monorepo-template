import Env from "@template/env";
import { AppError } from "../app-error";

type HttpErrorResponse = { body: Record<string, unknown>; statusCode: number };
type KnownPrismaError = {
  name: string;
  meta?: Record<string, string>;
  clientVersion: string;
  code: string;
};

const isProd = Env.NODE_ENV === "production";

const formatError = (err: AppError): Record<string, unknown> =>
  isProd ? err.toProdJSON() : err.toJSON();

const formatInternalError = (err: AppError): Record<string, unknown> =>
  isProd
    ? { message: "Something went wrong" }
    : { message: err.message, stack: err.stack, data: err.toJSON() };

export function parseError(err: unknown): HttpErrorResponse {
  // ---- AppError ----
  if (err instanceof AppError) {
    if (err.code === 500) {
      return { body: formatInternalError(err), statusCode: 500 };
    }
    return { body: formatError(err), statusCode: err.code ?? 500 };
  }

  // ---- Objects with a message ----
  if (has(err, "message")) {
    const message = String((err as { message: unknown }).message);

    // Action fail reason
    if (message.includes("type")) {
      const error = AppError.fromActionFailReason(message);
      return { body: formatError(error), statusCode: error.code ?? 500 };
    }

    // Prisma known request errors
    if (
      has(err, "name") &&
      (err as KnownPrismaError).name === "PrismaClientKnownRequestError"
    ) {
      const prismaErr = err as KnownPrismaError;
      const modelName = prismaErr.meta?.modelName ?? "Resource";

      if (prismaErr.code === "P2002") {
        const error = new AppError({
          type: "CONFLICT",
          message: `${modelName} already exists`,
        });
        return { body: formatError(error), statusCode: 409 };
      }

      if (prismaErr.code === "P2003") {
        const error = new AppError({
          type: "BAD_REQUEST",
          message: `${modelName} has failed foreign key reference.`,
        });
        return { body: formatError(error), statusCode: 400 };
      }

      if (prismaErr.code === "P2025") {
        const error = new AppError({
          type: "NOT_FOUND",
          message: `${modelName} was not found`,
        });
        return { body: formatError(error), statusCode: 404 };
      }
    }

    // Fallback: send message as JSON
    return {
      body: { error: (err as { message: string }).message },
      statusCode: 500,
    };
  }

  // ---- Unknown error type ----
  return {
    body: { error: JSON.stringify(err) },
    statusCode: 500,
  };
}

const has = (input: unknown, prop: string): boolean =>
  typeof input === "object" && input !== null && prop in input;
