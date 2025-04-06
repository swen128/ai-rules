import { redactSensitiveInfo, getValueByPath } from "../../util";
import type { LogSeverity, RawLogEntry } from "./api";
import type { LogId } from "./log-id";

/**
 * Log entry summary with essential information
 */
export type LogSummary = {
  insertId: LogId;
  timestamp: string;
  severity: LogSeverity;
  summary: string;
};

export function summarize(
  entry: RawLogEntry,
  summaryFields?: string[]
): LogSummary {
  const summary = extractLogSummaryText(entry, summaryFields);

  return {
    insertId: entry.insertId,
    timestamp: entry.timestamp,
    severity: entry.severity,
    summary,
  };
}

function extractLogSummaryText(
  entry: RawLogEntry,
  summaryFields?: string[]
): string {
  if (summaryFields && summaryFields.length > 0) {
    const parts: string[] = [];

    for (const field of summaryFields) {
      const value = getValueByPath(entry, field);
      if (value !== undefined) {
        parts.push(`${field}: ${String(value)}`);
      }
    }

    if (parts.length > 0) {
      return redactSensitiveInfo(parts.join(", "));
    }
  }

  if (typeof entry.textPayload === "string") {
    return redactSensitiveInfo(entry.textPayload);
  }

  if (entry.jsonPayload && typeof entry.jsonPayload === "object") {
    const jsonPayload = entry.jsonPayload as Record<string, unknown>;
    if (typeof jsonPayload.message === "string") {
      return redactSensitiveInfo(jsonPayload.message);
    }

    const message = findMessage(jsonPayload);
    if (message) {
      return redactSensitiveInfo(message);
    }
  }

  return `${JSON.stringify(entry).substring(0, 100)}...`;
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
