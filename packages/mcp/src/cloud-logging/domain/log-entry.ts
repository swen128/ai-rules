import { redactSensitiveInfo } from "../../util/redact";
import { formatTimestamp, getValueByPath } from "../utils";
import { LogId, createLogId } from "./log-id";

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
  const metadata = (entry.metadata as Record<string, unknown>) || {};

  // Extract values with type safety
  const timestamp = metadata.timestamp;
  const severity = metadata.severity as LogSeverity | undefined;
  const metadataInsertId = metadata.insertId as string | undefined;

  // Create the summary
  const summary: LogSummary = {
    insertId: entry.insertId,
    timestamp: formatTimestamp(timestamp),
    severity: severity || "DEFAULT",
    summary: extractSummary(entry, summaryFields),
  };

  // Add any explicitly requested fields
  if (summaryFields) {
    summaryFields.forEach((field) => {
      const value = getValueByPath(entry, field);

      if (value !== undefined) {
        // Use the last part of the field path as the key
        const key = field.split(".").pop() || field;
        summary[key] = value;
      }
    });
  }

  return summary;
}

/**
 * Extracts a summary from a log entry
 * @param entry The log entry
 * @param summaryFields Optional fields to include in the summary
 * @returns A summary string
 */
function extractSummary(entry: RawLogEntry, summaryFields?: string[]): string {
  // If summary fields are specified, try to extract them
  if (summaryFields && summaryFields.length > 0) {
    const extractedValues = summaryFields
      .map((field) => {
        const value = getValueByPath(entry, field);
        return value !== undefined ? String(value) : undefined;
      })
      .filter(Boolean);

    if (extractedValues.length > 0) {
      return redactSensitiveInfo(extractedValues.join(" | "));
    }
  }

  // Fallback strategy
  // 1. Look for textPayload
  if (entry.textPayload) {
    return redactSensitiveInfo(String(entry.textPayload));
  }

  // 2. Look for message in jsonPayload or protoPayload
  const payload =
    (entry.jsonPayload as Record<string, unknown>) ||
    (entry.protoPayload as Record<string, unknown>);
  if (payload) {
    const message = findMessage(payload);
    if (message) return redactSensitiveInfo(message);
  }

  // 3. Stringify and truncate
  const stringified = JSON.stringify(payload || entry);
  return redactSensitiveInfo(
    stringified.length > 200
      ? stringified.substring(0, 197) + "..."
      : stringified
  );
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
