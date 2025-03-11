import {Logging} from "@google-cloud/logging";
import {err, ok, Result} from "neverthrow";
import {CloudLoggingError, GetLogDetailParams, QueryLogsParams} from "../domain/types";
import {RawLogEntry} from "../domain/log-entry";
import {buildQueryOptions} from "../utils";
import {LogId, createLogId} from "../domain/log-id";
import { CloudLoggingApi } from "../domain/api";

/**
 * Implementation of Cloud Logging adapter using Google Cloud Logging client
 */
export class GoogleCloudLoggingApiClient implements CloudLoggingApi {

  /**
   * Creates a new GoogleCloudLoggingAdapter
   */
  constructor() {
    this.

  }

  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Result with entries and nextPageToken, or error
   */
   async entries(params): Promise<Result<{
    entries: RawLogEntry[];
    nextPageToken?: string;
  }, CloudLoggingError>> {
    try {
      const {projectId} = params;

      // Initialize the Cloud Logging client
      const logging = new Logging({projectId});

      // Build the query options
      const options = buildQueryOptions(params);

      // Execute the query
      const [entries, nextPageToken] = await logging.getEntries(options);

      // Convert entries to RawLogEntry in a type-safe way
      const typedEntries: RawLogEntry[] = entries.map(entry => {
        // Create a new object with string keys and unknown values
        const rawEntry: Record<string, unknown> = {};
        const json = entry.toJSON();

        // Copy all properties from json to rawEntry
        // Using type assertion only for this internal conversion
        const jsonObj = json as unknown as Record<string, unknown>;
        Object.keys(jsonObj).forEach(key => {
          rawEntry[key] = jsonObj[key];
        });

        // Ensure insertId is present
        if (!rawEntry.insertId) {
          rawEntry.insertId = createLogId(`generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
        } else {
          // Make sure insertId is a LogId
          rawEntry.insertId = createLogId(String(rawEntry.insertId));
        }

        return rawEntry as RawLogEntry;
      });

      return ok({
        entries: typedEntries,
        nextPageToken: nextPageToken ? String(nextPageToken) : undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return err({
        message: errorMessage,
        code: error instanceof Error && 'code' in error ? 
          (error as unknown as {code: CloudLoggingError['code']}).code : undefined
      });
    }
  }

  /**
   * Gets a log entry by ID
   * @param params Parameters for getting log details
   * @returns Result with log entry, or error
   */
  async getLogEntry(params: GetLogDetailParams): Promise<Result<RawLogEntry, CloudLoggingError>> {
    try {
      const {projectId, logId} = params;

      // Initialize the Cloud Logging client
      const logging = new Logging({projectId});

      // Query for the log entry
      const [entries] = await logging.getEntries({
        filter: `insertId="${logId}"`,
        pageSize: 1
      });

      if (!entries || entries.length === 0) {
        return err({
          message: `Log entry with ID ${logId} not found`,
          code: "NOT_FOUND"
        });
      }

      const entry = entries[0];
      if (!entry) {
        return err({
          message: `Log entry with ID ${logId} not found`,
          code: "NOT_FOUND"
        });
      }

      const rawEntry = entry.toJSON() as unknown as Record<string, unknown>;
      
      // Ensure insertId is present
      if (!rawEntry.insertId) {
        rawEntry.insertId = logId;
      } else {
        // Make sure insertId is a LogId
        rawEntry.insertId = createLogId(String(rawEntry.insertId));
      }

      return ok(rawEntry as RawLogEntry);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return err({
        message: errorMessage,
        code: error instanceof Error && 'code' in error ? 
          (error as unknown as {code: CloudLoggingError['code']}).code : undefined
      });
    }
  }
}

/**
 * Creates a mock Cloud Logging adapter for testing
 * @param mockEntries Optional mock entries to return
 * @returns A mock Cloud Logging adapter
 */
export function createMockCloudLoggingAdapter(mockEntries: RawLogEntry[] = []): CloudLoggingApi {
  return {
    async queryLogs(params: QueryLogsParams): Promise<Result<{
      entries: RawLogEntry[];
      nextPageToken?: string;
    }, CloudLoggingError>> {
      // Simulate filtering
      const filtered = mockEntries.filter(entry => {
        // Very basic filtering simulation
        if (params.filter.includes("severity>=ERROR")) {
          return (entry.severity === "ERROR" || entry.severity === "CRITICAL");
        }
        return true;
      });

      // Simulate pagination
      const pageSize = params.pageSize || 10;
      const hasMore = filtered.length > pageSize;

      return ok({
        entries: filtered.slice(0, pageSize),
        nextPageToken: hasMore ? "mock-next-page" : undefined
      });
    },

    async getLogEntry(params: GetLogDetailParams): Promise<Result<RawLogEntry, CloudLoggingError>> {
      const entry = mockEntries.find(e => e.insertId === params.logId);

      if (!entry) {
        return err({
          message: `Log entry with ID ${params.logId} not found`,
          code: "NOT_FOUND"
        });
      }

      return ok(entry);
    }
  };
}
