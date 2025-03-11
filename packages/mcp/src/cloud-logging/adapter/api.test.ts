import {describe, expect, test} from "bun:test";
import {createMockCloudLoggingAdapter} from "./api";
import {createLogId} from "./model/log-id";

describe("CloudLoggingApi", () => {
  describe("createMockCloudLoggingAdapter", () => {
    test("should create a mock adapter with default empty entries", async () => {
      const adapter = createMockCloudLoggingAdapter();
      
      const result = await adapter.queryLogs({
        projectId: "test-project",
        filter: "severity>=ERROR"
      });
      
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.entries).toHaveLength(0);
        expect(result.value.nextPageToken).toBeUndefined();
      }
    });
    
    test("should create a mock adapter with provided entries", async () => {
      const logId1 = createLogId("log-1");
      const logId2 = createLogId("log-2");
      
      const mockEntries = [
        { insertId: logId1, severity: "ERROR", textPayload: "Test error log" },
        { insertId: logId2, severity: "INFO", textPayload: "Test info log" }
      ];
      
      const adapter = createMockCloudLoggingAdapter(mockEntries);
      
      // Test queryLogs with severity filter
      const queryResult = await adapter.queryLogs({
        projectId: "test-project",
        filter: "severity>=ERROR"
      });
      
      expect(queryResult.isOk()).toBe(true);
      if (queryResult.isOk()) {
        expect(queryResult.value.entries).toHaveLength(1);
        const entry = queryResult.value.entries[0];
        expect(entry?.severity).toBe("ERROR");
      }
      
      // Test getLogEntry with existing ID
      const getResult = await adapter.getLogEntry({
        projectId: "test-project",
        logId: logId1
      });
      
      expect(getResult.isOk()).toBe(true);
      if (getResult.isOk()) {
        expect(getResult.value.textPayload).toBe("Test error log");
      }
      
      // Test getLogEntry with non-existent ID
      const nonExistentResult = await adapter.getLogEntry({
        projectId: "test-project",
        logId: createLogId("non-existent")
      });
      
      expect(nonExistentResult.isErr()).toBe(true);
      if (nonExistentResult.isErr()) {
        expect(nonExistentResult.error.code).toBe("NOT_FOUND");
      }
    });
    
    test("should handle pagination in mock adapter", async () => {
      // Create 15 mock entries
      const mockEntries = Array.from({ length: 15 }, (_, i) => ({
        insertId: createLogId(`log-${i}`),
        severity: "INFO",
        textPayload: `Test log ${i}`
      }));
      
      const adapter = createMockCloudLoggingAdapter(mockEntries);
      
      // Query with pageSize 10
      const firstPageResult = await adapter.queryLogs({
        projectId: "test-project",
        filter: "",
        pageSize: 10
      });
      
      expect(firstPageResult.isOk()).toBe(true);
      if (firstPageResult.isOk()) {
        expect(firstPageResult.value.entries).toHaveLength(10);
        expect(firstPageResult.value.nextPageToken).toBe("mock-next-page");
      }
    });
  });
});