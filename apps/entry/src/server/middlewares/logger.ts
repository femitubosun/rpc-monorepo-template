import { PrettyStream } from "@template/logging";
import { pinoLogger } from "hono-pino";
import { pino } from "pino";

export function logger() {
  return pinoLogger({
    http: {
      reqId: () => crypto.randomUUID(),
    },
    pino: (_c) =>
      pino(
        {
          level: "error",
          timestamp: pino.stdTimeFunctions.epochTime,
        },
        PrettyStream,
      ),
  });
}
