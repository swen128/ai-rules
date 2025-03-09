/**
 * Service for Cloud Logging MCP server
 */
import {
  GetLogDetailParams,
  GetLogDetailResponse,
  GetLogDetailResult,
  OperationError,
  QueryLogsParams,
  QueryLogsResponse,
  QueryLogsResult
} from "./model/types";
import {CloudLoggingApi} from "./api";
import {LogCache} from "./cache";
import {createLogSummary} from "./model/log-entry";

/**
 * Interface for Cloud Logging service
 */
export interface CloudLoggingService {
  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Query result or error
   */
  queryLogs(params: QueryLogsParams): Promise<QueryLogsResponse>;

  /**
   * Gets detailed information for a log entry
   * @param params Parameters for getting log details
   * @returns Log details or error
   */
  getLogDetail(params: GetLogDetailParams): Promise<GetLogDetailResponse>;
}

/**
 * Implementation of Cloud Logging service
 */
export class CloudLoggingServiceImpl implements CloudLoggingService {
  constructor(
    private readonly cache: LogCache,
    private readonly api: CloudLoggingApi,
  ) {
  }

  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Query result or error
   */
  async queryLogs(params: QueryLogsParams): Promise<QueryLogsResult | OperationError> {
    const result = await this.api.queryLogs(params);

    if (result.isErr()) {
      return {
        error: result.error
      };
    }

    const {entries, nextPageToken} = result.value;
    const {summaryFields} = params;

    for (const entry of entries) {
      this.cache.add(entry.insertId, entry);
    }

    // Transform the entries to summaries
    const logSummaries = entries.map(entry => createLogSummary(entry, summaryFields));
    return {
      logs: logSummaries,
      pageSize: params.pageSize || 10,
      nextPageToken
    };
  }

  // TODO: Return discriminated union type
  async getLogDetail(params: GetLogDetailParams): Promise<GetLogDetailResult | OperationError> {
    const result = await this.api.getLogEntry(params);
    return result.isErr() ? {error: result.error} : {log: result.value};
  }
}
