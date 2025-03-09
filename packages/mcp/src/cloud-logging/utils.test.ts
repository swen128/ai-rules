import {describe, expect, test} from "bun:test";
import {
  buildQueryOptions,
  extractSummary,
  findMessage,
  formatTimestamp,
  getValueByPath,
  redactSensitiveInfo
} from "./utils";

describe("Cloud Logging Utils", () => {
  describe("redactSensitiveInfo", () => {
    test("should redact API keys", () => {
      const text = 'apiKey: "abcdef1234567890"';
      const redacted = redactSensitiveInfo(text);
      expect(redacted).toContain("****");
      expect(redacted).not.toContain("abcdef1234567890");
      // Should preserve first and last 4 chars
      expect(redacted).toMatch(/apiKey: "abcd\*+7890"/);
    });

    test("should redact credit card numbers", () => {
      const text = "My card is 1234-5678-9012-3456";
      const redacted = redactSensitiveInfo(text);
      expect(redacted).toContain("****");
      expect(redacted).not.toContain("1234-5678-9012-3456");
    });

    test("should redact email addresses", () => {
      const text = "Contact me at user@example.com";
      const redacted = redactSensitiveInfo(text);
      expect(redacted).toContain("****");
      expect(redacted).not.toContain("user@example.com");
    });

    test("should redact IP addresses", () => {
      const text = "Server IP: 192.168.1.1";
      const redacted = redactSensitiveInfo(text);
      expect(redacted).toContain("****");
      expect(redacted).not.toContain("192.168.1.1");
    });

    test("should handle empty input", () => {
      expect(redactSensitiveInfo("")).toBe("");
      expect(redactSensitiveInfo(null as unknown as string)).toBe(null as unknown as string);
      expect(redactSensitiveInfo(undefined as unknown as string)).toBe(undefined as unknown as string);
    });
  });

  describe("findMessage", () => {
    test("should find message at top level", () => {
      const obj = {message: "Hello world"};
      expect(findMessage(obj)).toBe("Hello world");
    });

    test("should find message in nested object", () => {
      const obj = {
        data: {
          info: {
            message: "Nested message"
          }
        }
      };
      expect(findMessage(obj)).toBe("Nested message");
    });

    test("should return undefined if no message found", () => {
      const obj = {data: {info: {text: "Not a message"}}};
      expect(findMessage(obj)).toBeUndefined();
    });

    test("should handle non-object input", () => {
      expect(findMessage(null)).toBeUndefined();
      expect(findMessage(undefined)).toBeUndefined();
      expect(findMessage("string")).toBeUndefined();
      expect(findMessage(123)).toBeUndefined();
    });
  });

  describe("getValueByPath", () => {
    const testObj = {
      name: "Test",
      metadata: {
        labels: {
          service: "api",
          version: "v1"
        }
      },
      data: {
        message: "Hello"
      }
    };

    test("should get value from top level", () => {
      expect(getValueByPath(testObj, "name")).toBe("Test");
    });

    test("should get value from nested path", () => {
      expect(getValueByPath(testObj, "metadata.labels.service")).toBe("api");
      expect(getValueByPath(testObj, "data.message")).toBe("Hello");
    });

    test("should return undefined for non-existent path", () => {
      expect(getValueByPath(testObj, "foo")).toBeUndefined();
      expect(getValueByPath(testObj, "metadata.foo")).toBeUndefined();
      expect(getValueByPath(testObj, "metadata.labels.foo")).toBeUndefined();
    });

    test("should handle non-object input", () => {
      expect(getValueByPath(null, "name")).toBeUndefined();
      expect(getValueByPath(undefined, "name")).toBeUndefined();
      expect(getValueByPath("string", "name")).toBeUndefined();
    });
  });

  describe("extractSummary", () => {
    const testEntry = {
      textPayload: "Text message",
      jsonPayload: {
        message: "JSON message",
        details: {
          info: "More info"
        }
      },
      metadata: {
        labels: {
          service: "api",
          environment: "production"
        }
      }
    };

    test("should extract specified fields", () => {
      const summary = extractSummary(testEntry, ["metadata.labels.service", "metadata.labels.environment"]);
      expect(summary).toBe("api | production");
    });

    test("should use textPayload as fallback", () => {
      const summary = extractSummary(testEntry, ["nonexistent.field"]);
      expect(summary).toBe("Text message");
    });

    test("should find message in jsonPayload as second fallback", () => {
      const entryWithoutText = {...testEntry, textPayload: undefined};
      const summary = extractSummary(entryWithoutText, ["nonexistent.field"]);
      expect(summary).toBe("JSON message");
    });

    test("should stringify as last resort", () => {
      const entryWithoutTextOrMessage = {
        data: {foo: "bar"}
      };
      const summary = extractSummary(entryWithoutTextOrMessage, ["nonexistent.field"]);
      expect(summary).toContain("{");
      expect(summary).toContain("foo");
      expect(summary).toContain("bar");
    });

    test("should truncate long stringified content", () => {
      const longEntry = {
        data: {longText: "a".repeat(300)}
      };
      const summary = extractSummary(longEntry, ["nonexistent.field"]);
      expect(summary.length).toBeLessThan(300);
      expect(summary.endsWith("...")).toBe(true);
    });
  });

  describe("formatTimestamp", () => {
    test("should format Date object", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      expect(formatTimestamp(date)).toBe("2023-01-01T12:00:00.000Z");
    });

    test("should format object with toISOString method", () => {
      const obj = {
        toISOString: () => "2023-01-01T12:00:00.000Z"
      };
      expect(formatTimestamp(obj)).toBe("2023-01-01T12:00:00.000Z");
    });

    test("should format Protobuf Timestamp", () => {
      const timestamp = {
        seconds: "1672574400", // 2023-01-01T12:00:00Z
        nanos: 0
      };
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toMatch(/2023-01-01T\d{2}:00:00\.000Z/);
    });

    test("should handle string timestamp", () => {
      expect(formatTimestamp("2023-01-01T12:00:00Z")).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    test("should use current time for undefined/null", () => {
      const now = new Date().toISOString().substring(0, 10); // Just compare the date part
      expect(formatTimestamp(undefined)).toContain(now);
      expect(formatTimestamp(null)).toContain(now);
    });
  });

  describe("buildQueryOptions", () => {
    test("should build basic options", () => {
      const params = {
        filter: "severity>=ERROR",
        pageSize: 20
      };
      const options = buildQueryOptions(params);
      expect(options.filter).toBe("severity>=ERROR");
      expect(options.pageSize).toBe(20);
    });

    test("should include resourceNames if provided", () => {
      const params = {
        filter: "severity>=ERROR",
        resourceNames: ["projects/my-project/logs/stdout"]
      };
      const options = buildQueryOptions(params);
      expect(options.resourceNames).toEqual(["projects/my-project/logs/stdout"]);
    });

    test("should include pageToken if provided", () => {
      const params = {
        filter: "severity>=ERROR",
        pageToken: "next-page-token"
      };
      const options = buildQueryOptions(params);
      expect(options.pageToken).toBe("next-page-token");
    });

    test("should format orderBy correctly", () => {
      const params = {
        filter: "severity>=ERROR",
        orderBy: {timestamp: "desc" as const}
      };
      const options = buildQueryOptions(params);
      expect(options.orderBy).toBe("timestamp desc");
    });

    test("should use default pageSize if not provided", () => {
      const params = {
        filter: "severity>=ERROR"
      };
      const options = buildQueryOptions(params);
      expect(options.pageSize).toBe(10);
    });
  });
});