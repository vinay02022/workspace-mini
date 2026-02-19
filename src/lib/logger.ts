/**
 * Structured Logger Utility
 * Provides consistent, structured logging across the application.
 * Logs are output as JSON in production for machine parsing,
 * and as human-readable format in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    return JSON.stringify(entry);
  }

  const { timestamp, level, message, context, ...rest } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const ctx = context ? ` [${context}]` : "";
  const extras = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `${prefix}${ctx} ${message}${extras}`;
}

function createEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = createEntry(level, message, meta);
  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Logger with context support.
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Workflow created", { context: "API", workflowId: "abc123" });
 *   
 *   const apiLogger = logger.child("API");
 *   apiLogger.info("Request received", { method: "POST", path: "/api/run" });
 */
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),

  /**
   * Create a child logger with a preset context label.
   */
  child: (context: string) => ({
    debug: (message: string, meta?: Record<string, unknown>) =>
      log("debug", message, { context, ...meta }),
    info: (message: string, meta?: Record<string, unknown>) =>
      log("info", message, { context, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      log("warn", message, { context, ...meta }),
    error: (message: string, meta?: Record<string, unknown>) =>
      log("error", message, { context, ...meta }),
  }),
};
