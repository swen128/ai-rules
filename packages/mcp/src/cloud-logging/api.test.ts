import {afterAll, beforeEach, describe, expect, test} from "bun:test";
import {GoogleCloudLoggingApiClient} from "./adapter";
import {Logging} from "@google-cloud/logging";
import {createLogId} from "./model/log-id";

// Create a mock implementation of the Logging class
class MockLogging {
  public getEntries: (options: any) => Promise<[any[], string | null]>;

  constructor() {
    this.getEntries = async () => [[], null];
  }
}

// Store original Logging constructor
const OriginalLogging = Logging;

describe("GoogleCloudLoggingAdapter", () => {
  let adapter: GoogleCloudLoggingApiClient;
  let mockLogging: MockLogging;

  beforeEach(() => {
    // Create a new mock instance
    mockLogging = new MockLogging();

    // Override the Logging constructor
    (Logging as any) = function () {
      return mockLogging;
    };

    // Create a new adapter instance
    adapter = new GoogleCloudLoggingApiClient();
  });

  afterAll(() => {
    // Restore original Logging
    (Logging as any) = OriginalLogging;
  });

  describe("queryLogs", () => {
    test("should return successful result with entries and nextPageToken", async () => {
      // Mock entries and nextPageToken
      const mockEntries = [
        {toJSON: () => ({insertId: "log-1", textPayload: "Test log 1"})},
        {toJSON: () => ({insertId: "log-2", textPayload: "Test log 2"})}
      ];
      const mockNextPageToken = "next-page-token";

      // Setup the mock to return entries and nextPageToken
      mockLogging.getEntries = async () => [mockEntries, mockNextPageToken];

      // Call the method
      const result = await adapter.queryLogs({
        projectId: "test-project",
        filter: "severity>=ERROR"
      });

      // Verify the result
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.entries).toHaveLength(2);
        expect(result.value.entries[0]).toEqual({insertId: "log-1", textPayload: "Test log 1"});
        expect(result.value.entries[1]).toEqual({insertId: "log-2", textPayload: "Test log 2"});
        expect(result.value.nextPageToken).toBe("next-page-token");
      }
    });

    test("should include all query parameters in options", async () => {
      // Setup a spy to capture the options
      let capturedOptions: any = null;
      mockLogging.getEntries = async (options) => {
        capturedOptions = options;
        return [[], null];
      };

      // Call the method with all parameters
      await adapter.queryLogs({
        projectId: "test-project",
        filter: "severity>=ERROR",
        resourceNames: ["projects/test-project/logs/stdout"],
        pageSize: 20,
        pageToken: "page-token",
        orderBy: {timestamp: "desc"}
      });

      // Verify the options
      expect(capturedOptions).toEqual({
        filter: "severity>=ERROR",
        resourceNames: ["projects/test-project/logs/stdout"],
        pageSize: 20,
        pageToken: "page-token",
        orderBy: "timestamp desc"
      });
    });

    test("should return error result when API call fails", async () => {
      // Setup the mock to throw an error
      const mockError = new Error("API error");
      (mockError as any).code = "PERMISSION_DENIED";
      mockLogging.getEntries = async () => {
        throw mockError;
      };

      // Call the method
      const result = await adapter.queryLogs({
        projectId: "test-project",
        filter: "severity>=ERROR"
      });

      // Verify the result
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("API error");
        expect(result.error.code).toBe("PERMISSION_DENIED");
      }
    });
  });

  describe("getLogEntry", () => {
    test("should return successful result with log entry", async () => {
      // Mock entry
      const mockEntry = {toJSON: () => ({insertId: "log-1", textPayload: "Test log"})};

      // Setup the mock to return the entry
      mockLogging.getEntries = async () => [[mockEntry], null];

      // Call the method
      const result = await adapter.getLogEntry({
        projectId: "test-project",
        logId: createLogId("log-1")
      });

      // Verify the result
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({insertId: "log-1", textPayload: "Test log"});
      }
    });

    test("should return NOT_FOUND error when log entry doesn't exist", async () => {
      // Setup the mock to return empty array
      mockLogging.getEntries = async () => [[], null];

      // Call the method
      const result = await adapter.getLogEntry({
        projectId: "test-project",
        logId: createLogId("non-existent")
      });

      // Verify the result
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("not found");
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    test("should return error result when API call fails", async () => {
      // Setup the mock to throw an error
      const mockError = new Error("API error");
      (mockError as any).code = "INTERNAL";
      mockLogging.getEntries = async () => {
        throw mockError;
      };

      // Call the method
      const result = await adapter.getLogEntry({
        projectId: "test-project",
        logId: createLogId("log-1")
      });

      // Verify the result
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("API error");
        expect(result.error.code).toBe("INTERNAL");
      }
    });
  });
});