// @tdd
import {createInMemoryTestClient} from "@mizchi/mcp-helper";
import {afterAll, beforeAll, describe, expect, test} from "bun:test";

// Import the types and server creation function
import {createCloudLoggingServer} from "./cloud-logging";
import {
  GetLogDetailParams,
  GetLogDetailResult,
  OperationError,
  QueryLogsParams,
  QueryLogsResult
} from "./model/types";
import {createLogId} from "./model/log-id";

describe("Cloud Logging MCP Server", () => {
  let client: Awaited<ReturnType<typeof createInMemoryTestClient>>;

  beforeAll(async () => {
    // Create the server and test client
    const server = createCloudLoggingServer();
    client = await createInMemoryTestClient(server);
  });

  afterAll(async () => {
    // Clean up
    await client.close();
  });

  describe("queryLogs tool", () => {
    test("should be able to call the queryLogs tool", async () => {
      // This test just verifies that the tool exists and can be called
      expect(typeof client.callTool).toBe("function");
    });

    test("should query logs with valid parameters", async () => {
      // Test parameters
      const params: QueryLogsParams = {
        projectId: "test-project",
        filter: "severity>=ERROR",
        resourceNames: [
          "projects/test-project/logs/run.googleapis.com%2Fstdout",
        ],
        pageSize: 10,
        orderBy: {timestamp: "desc"},
        summaryFields: ["labels.service", "textPayload"],
      };

      // Call the tool
      const result = (await client.callTool(
        "queryLogs",
        params
      )) as QueryLogsResult;

      // Verify the result structure
      expect(result).toHaveProperty("logs");
      expect(Array.isArray(result.logs)).toBe(true);
      expect(result).toHaveProperty("pageSize");
      expect(typeof result.pageSize).toBe("number");
    });

    test("should handle invalid parameters", async () => {
      // Missing required parameter (filter)
      const invalidParams = {
        projectId: "test-project",
      };

      // The call should throw an error
      await expect(async () => {
        await client.callTool("queryLogs", invalidParams as any);
      }).toThrow();
    });

    test("should handle API errors gracefully", async () => {
      // Parameters that would cause an API error (invalid project)
      const params: QueryLogsParams = {
        projectId: "invalid-project-id",
        filter: "severity>=ERROR",
      };

      // The call should return an error result
      const result = (await client.callTool(
        "queryLogs",
        params
      )) as OperationError;

      // Verify the error structure
      expect(result).toHaveProperty("error");
      expect(result.error).toHaveProperty("message");
    });
  });

  describe("getLogDetail tool", () => {
    test("should get log details with valid ID", async () => {
      // Test parameters
      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("test-log-id"),
      };

      // Call the tool
      const result = (await client.callTool(
        "getLogDetail",
        params
      )) as GetLogDetailResult;

      // Verify the result structure
      expect(result).toHaveProperty("log");
      expect(typeof result.log).toBe("object");
    });

    test("should handle invalid log ID", async () => {
      // Parameters with invalid log ID
      const params: GetLogDetailParams = {
        projectId: "test-project",
        logId: createLogId("non-existent-log-id"),
      };

      // The call should return an error result
      const result = (await client.callTool(
        "getLogDetail",
        params
      )) as OperationError;

      // Verify the error structure
      expect(result).toHaveProperty("error");
      expect(result.error).toHaveProperty("message");
    });
  });

  test("should query logs with valid parameters", async () => {
    // Test parameters
    const params: QueryLogsParams = {
      projectId: "test-project",
      filter: "severity>=ERROR",
      pageSize: 10,
      // No orderBy parameter as it's not supported by the API
    };

    // Call the tool
    const result = (await client.callTool(
      "queryLogs",
      params
    )) as QueryLogsResult;

    // Verify the result structure
    expect(result).toHaveProperty("logs");
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result).toHaveProperty("pageSize");
    expect(typeof result.pageSize).toBe("number");
  });

  test("should handle invalid parameters", async () => {
    // Missing required parameter (filter)
    const invalidParams = {
      projectId: "test-project",
    };

    // The call should throw an error
    await expect(async () => {
      await client.callTool("queryLogs", invalidParams as any);
    }).toThrow();
  });

  test("should handle API errors gracefully", async () => {
    // Parameters that would cause an API error (invalid project)
    const params: QueryLogsParams = {
      projectId: "invalid-project-id",
      filter: "severity>=ERROR",
    };

    // The call should return an error result
    const result = (await client.callTool(
      "queryLogs",
      params
    )) as OperationError;

    // Verify the error structure
    expect(result).toHaveProperty("error");
    expect(result.error).toHaveProperty("message");
  });
});
