import { Result } from "neverthrow";
import { RawLogEntry } from "./log-entry";

/**
 * Interface for Cloud Logging adapter
 */
export interface CloudLoggingApi {
  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Result with entries and nextPageToken, or error
   */
  entries(params: QueryLogsParams): Promise<
    Result<
      {
        entries: RawLogEntry[];
        nextPageToken?: string;
      },
      CloudLoggingError
    >
  >;
}

type QueryLogsParam = {
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
 * Error types for Cloud Logging operations
 */
type CloudLoggingErrorCode =
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INVALID_ARGUMENT"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "UNAUTHENTICATED";

/**
 * Error details for Cloud Logging operations
 */
type CloudLoggingError = {
  message: string;
  code?: CloudLoggingErrorCode;
};
