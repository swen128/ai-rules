import {beforeEach, describe, expect, test} from "bun:test";
import {err, ok, Result} from "neverthrow";
import {
  CloudLoggingError,
  GetLogDetailParams,
  QueryLogsParams,
} from "./model/types";
import {CloudLoggingService, createCloudLoggingService} from "./service";
import {CloudLoggingApi} from "./api";
import {RawLogEntry} from "./model/log-entry";
import {createLogId} from "./model/log-id";

// Create a mock adapter for testing
class MockCloudLoggingAdapter implements CloudLoggingApi {
  // Mock data for testing
  private mockLogs: Record<string, RawLogEntry> = {
    "log-1": {
      insertId: "log-1",
      metadata: {
        insertId: "log-1",
        timestamp: "2023-01-01T12:00:00Z",
        severity: "ERROR"
      },
      textPayload: "Test error log"
    },
    "log-2": {
      insertId: "log-2",
      metadata: {
        insertId: "log-2",
        timestamp: "2023-01-01T12:30:00Z",
        severity: "INFO"
      },
      textPayload: "Test info log"
    }
  };

  // Mock behavior flags
  public shouldFailQuery = false;
  public shouldFailGetEntry = false;
  public shouldReturnEmptyResults = false;

  async queryLogs(params: QueryLogsParams): Promise<Result<{
    entries: RawLogEntry[];
    nextPageToken?: string;
  }, CloudLoggingError>> {
    if (this.shouldFailQuery) {
      return err({
        message: "Mock query failure",
        code: "INTERNAL"
      });
    }

    if (this.shouldReturnEmptyResults) {
      return ok({
        entries: [],
        nextPageToken: undefined
      });
    }

    // Simple filtering based on severity
    let entries = Object.values(this.mockLogs);
    if (params.filter.includes("severity>=ERROR")) {
      entries = entries.filter(entry => {
        const metadata = entry.metadata as Record<string, unknown> | undefined;
        return metadata?.severity === "ERROR" || metadata?.severity === "CRITICAL";
      });
    }

    // Apply pagination
    const pageSize = params.pageSize || 10;
    const hasMore = entries.length > pageSize;
    const pagedEntries = entries.slice(0, pageSize);

    return ok({
      entries: pagedEntries,
      nextPageToken: hasMore ? "mock-next-page" : undefined
    });
  }

  async getLogEntry(params: GetLogDetailParams): Promise<Result<RawLogEntry, CloudLoggingError>> {
    if (this.shouldFailGetEntry) {
      return err({
        message: "Mock get entry failure",
        code: "INTERNAL"
      });
    }

    const logId = params.logId as unknown as string;
    const entry = this.mockLogs[logId];

    if (!entry) {
      return err({
        message: `Log entry with ID ${logId} not found`,
        code: "NOT_FOUND"
      });
    }

    return ok(entry);
  }
}

describe("CloudLoggingService", () => {
  let adapter: MockCloudLoggingAdapter;
  let service: CloudLoggingService;

  beforeEach(() => {
    adapter = new MockCloudLoggingAdapter();
    service = createCloudLoggingService(adapter);
  });

  describe("queryLogs", () => {
    test("should return log summaries on successful query", async () => {
      const params: QueryLogsParams = {
        projectId: "test-project",
        filter: "severity>=ERROR"
      };

      const result = await service.queryLogs(params);

      // Check that it's not an error
      expect("error" in result).toBe(false);

      if (!("error" in result)) {
        expect(result.logs).toBeDefined();
        expect(Array.isArray(result.logs)).toBe(true);
        expect(result.pageSize).toBe(10);
      }
    });

    test("should return error on failed query", async () => {
      adapter.shouldFailQuery = true;

      const params: QueryLogsParams = {
        projectId: "test-project",
        filter: "severity>=ERROR"
      };

      const result = await service.queryLogs(params);

      // Check that it's an error
      expect("error" in result).toBe(true);

      if ("error" in result) {
        expect(result.error.message).toBe("Mock query failure");
        expect(result.error.code).toBe("INTERNAL");
      }
    });

    test("should handle empty results", async () => {
      adapter.shouldReturnEmptyResults = true;

      const params: QueryLogsParams = {
        projectId: "test-project",
        filter: "severity>=ERROR"
      };

      const result = await service.queryLogs(params);

      // Check that it's not an error
      expect("error" in result).toBe(false);

      if (!("error" in result)) {
        expect(result.logs).toHaveLength(0);
      }
    });

    test("should respect pageSize parameter", async () => {
      const params: QueryLogsParams = {
        projectId: "test-project",
        filter: "severity>=ERROR",
        pageSize: 5
      };

      const result = await service.queryLogs(params);

      // Check that it's not an error
      expect("error" in result).toBe(false);

      if (!("error" in result)) {
        expect(result.pageSize).toBe(5);
      }
    });
  });

  describe("getLogDetail", () => {
    test("should return log details on successful query", async () => {
      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("log-1")
      };

      const result = await service.getLogDetail(params);

      // Check that it's not an error
      expect("error" in result).toBe(false);

      if (!("error" in result)) {
        expect(result.log).toBeDefined();
        expect(result.log.insertId).toBe("log-1");
        expect(result.log.textPayload).toBe("Test error log");
      }
    });

    test("should return error on failed query", async () => {
      adapter.shouldFailGetEntry = true;

      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("log-1")
      };

      const result = await service.getLogDetail(params);

      // Check that it's an error
      expect("error" in result).toBe(true);

      if ("error" in result) {
        expect(result.error.message).toBe("Mock get entry failure");
        expect(result.error.code).toBe("INTERNAL");
      }
    });

    test("should return NOT_FOUND error for non-existent log", async () => {
      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("non-existent")
      };

      const result = await service.getLogDetail(params);

      // Check that it's an error
      expect("error" in result).toBe(true);

      if ("error" in result) {
        expect(result.error.message).toContain("not found");
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    test("should use cache for repeated queries", async () => {
      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("log-1")
      };

      // First query should hit the adapter
      await service.getLogDetail(params);

      // Now make the adapter fail
      adapter.shouldFailGetEntry = true;

      // Second query should use cache and not fail
      const result = await service.getLogDetail(params);

      // Check that it's not an error (because it used the cache)
      expect("error" in result).toBe(false);

      if (!("error" in result)) {
        expect(result.log).toBeDefined();
        expect(result.log.insertId).toBe("log-1");
      }
    });
  });
});