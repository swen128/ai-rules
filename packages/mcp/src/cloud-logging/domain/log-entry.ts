import { redactSensitiveInfo } from "../../util/redact";
import { type LogId, createLogId } from "./log-id";

/**
 * Raw log entry from Google Cloud Logging
 */
export type RawLogEntry = Record<string, unknown> & {
  insertId: LogId;
};

/**
 * Severity levels for log entries
 */
export type LogSeverity =
  | "DEFAULT"
  | "DEBUG"
  | "INFO"
  | "NOTICE"
  | "WARNING"
  | "ERROR"
  | "CRITICAL"
  | "ALERT"
  | "EMERGENCY";

/**
 * Log entry summary with essential information
 */
export type LogSummary = {
  insertId: LogId;
  timestamp: string;
  severity: LogSeverity;
  summary: string;
  [key: string]: unknown;
};

/**
 * Creates a log summary from a log entry
 * @param entry The log entry
 * @param summaryFields Optional fields to include in the summary
 * @returns A LogSummary object
 */
export function createLogSummary(
  entry: RawLogEntry,
  summaryFields?: string[]
): LogSummary {
  // TODO: Implement this
}

/**
 * Extracts a summary from a log entry
 * @param entry The log entry
 * @param summaryFields Optional fields to include in the summary
 * @returns A summary string
 */
function extractSummary(entry: RawLogEntry, summaryFields?: string[]): string {
  // TODO: Implement this
}

/**
 * Recursively searches for a message field in an object
 * @param obj The object to search
 * @returns The message if found, undefined otherwise
 */
function findMessage(obj: Record<string, unknown>): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  if ("message" in obj) return String(obj.message);

  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const message = findMessage(obj[key] as Record<string, unknown>);
      if (message) return message;
    }
  }

  return undefined;
}
