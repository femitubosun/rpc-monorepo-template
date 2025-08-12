import Env from "@template/env";
import chalk from "chalk";
import pretty from "pino-pretty";

function formatLevel(level: number) {
  switch (level) {
    case 10:
      return chalk.gray("DEBUG");
    case 20:
      return chalk.yellow("TRACE");
    case 30:
      return chalk.cyan("LOG");
    case 40:
      return chalk.yellow("WARN");
    case 50:
      return chalk.red("ERROR");
    case 60:
      return chalk.red.bold("FATAL");
    default:
      return "LOG";
  }
}

function getContext(meta: any) {
  const name = meta.name || meta.context;
  return name ? chalk.magenta(`[${name}]`) : "";
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export const nestStyleTransport = pretty({
  messageFormat: (log: any, messageKey: string) => {
    const pid = process.pid;
    const time = formatTime(log.time);
    const level = formatLevel(log.level);
    const msg = log[messageKey];
    const context = getContext(log);

    let output = `${chalk.gray(
      `[${Env.APP_NAME.toUpperCase()}] ${pid} - ${time}`,
    )} ${level} ${context} ${msg}`;

    if (log.err?.stack) {
      output += `\n${chalk.red(log.err.stack)}`;
    } else if (log.stack) {
      output += `\n${chalk.red(log.stack)}`;
    }

    return `${output}\n`;
  },
  ignore: "time,level,pid,hostname,err,stack",
  hideObject: false,
  translateTime: false,
  singleLine: false,
  levelFirst: false,
});
