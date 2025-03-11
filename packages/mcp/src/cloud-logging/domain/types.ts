/**
 * Common type definitions for Cloud Logging MCP server
 */

import {LogSummary} from "./log-entry";
import {LogId} from "./log-id";

/**
 * Error types for Cloud Logging operations
 */
export type CloudLoggingErrorCode =
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INVALID_ARGUMENT"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "UNAUTHENTICATED";

/**
 * Error details for Cloud Logging operations
 */
export type CloudLoggingError = {
  message: string;
  code?: CloudLoggingErrorCode;
};

/**
 * Error result when an operation fails
 */
export type OperationError = {
  error: CloudLoggingError;
};

/**
 * MCP Tool definition
 */
export type CloudLoggingTools = {
  queryLogs: {
    params: QueryLogsParams;
    result: QueryLogsResponse;
  };
  getLogDetail: {
    params: GetLogDetailParams;
    result: GetLogDetailResponse;
  };
};


/**
 * Parameters for querying logs
 */
export type QueryLogsParams = {
  projectId: string;
  filter: string;
  resourceNames?: string[]; // e.g. "projects/project_id/logs/run.googleapis.com%2Fstdout"
  pageSize?: number;
  pageToken?: string;
  orderBy?: {
    timestamp: "asc" | "desc";
  };
  summaryFields?: string[]; // Fields to include in the summary, e.g. ["labels.service", "textPayload"]
};

/**
 * Result of a log query operation
 */
export type QueryLogsResult = {
  logs: LogSummary[]; // Summarized log entries
  pageSize: number; // Number of logs per page
  nextPageToken?: string; // Token for retrieving the next page
};

/**
 * Parameters for getting log details
 */
export type GetLogDetailParams = {
  projectId: string;
  logId: LogId; // The insertId of the log entry
};

/**
 * Result of a get log detail operation
 */
export type GetLogDetailResult = {
  log: Record<string, unknown>; // The complete log entry
};

/**
 * Combined result types (success or error)
 */
export type QueryLogsResponse = QueryLogsResult | OperationError;
export type GetLogDetailResponse = GetLogDetailResult | OperationError;
