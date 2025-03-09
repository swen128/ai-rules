import {beforeEach, describe, expect, jest, test} from "bun:test";
import {createLogCache, LogCache} from "./cache";

describe("LogCache", () => {
  let cache: LogCache;

  beforeEach(() => {
    cache = createLogCache();
  });

  test("should add and retrieve entries", () => {
    const entry = {id: "123", message: "Test log"};
    cache.add("log-123", entry);

    const retrieved = cache.get("log-123");
    expect(retrieved).toEqual(entry);
  });

  test("should return undefined for non-existent entries", () => {
    expect(cache.get("non-existent")).toBeUndefined();
  });

  test("should expire entries after TTL", async () => {
    // Create cache with short TTL (100ms)
    const shortTtlCache = createLogCache({
      ttlMs: 100,
      maxEntries: 10
    });

    const entry = {id: "123", message: "Test log"};

    shortTtlCache.add("log-123", entry);
    expect(shortTtlCache.get("log-123")).toEqual(entry);

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Entry should be expired
    expect(shortTtlCache.get("log-123")).toBeUndefined();
  });

  test("should remove oldest entries when cache is full", () => {
    // Create cache with small capacity
    const smallCache = createLogCache({
      ttlMs: 30 * 60 * 1000,
      maxEntries: 3
    });

    // Mock Date.now to control timestamps
    const originalNow = Date.now;
    let mockTime = 1000;

    try {
      // @ts-ignore - Mocking Date.now
      Date.now = jest.fn(() => mockTime);

      // Add entries with increasing timestamps
      smallCache.add("log-1", {id: "1"});
      mockTime += 1000;
      smallCache.add("log-2", {id: "2"});
      mockTime += 1000;
      smallCache.add("log-3", {id: "3"});

      // All entries should be present
      expect(smallCache.get("log-1")).toEqual({id: "1"});
      expect(smallCache.get("log-2")).toEqual({id: "2"});
      expect(smallCache.get("log-3")).toEqual({id: "3"});

      // Add one more entry, should evict the oldest (log-1)
      mockTime += 1000;
      smallCache.add("log-4", {id: "4"});

      // log-1 should be evicted
      expect(smallCache.get("log-1")).toBeUndefined();
      expect(smallCache.get("log-2")).toEqual({id: "2"});
      expect(smallCache.get("log-3")).toEqual({id: "3"});
      expect(smallCache.get("log-4")).toEqual({id: "4"});
    } finally {
      // Restore original Date.now
      Date.now = originalNow;
    }
  });

  test("should clear all entries", () => {
    cache.add("log-1", {id: "1"});
    cache.add("log-2", {id: "2"});

    expect(cache.size).toBe(2);

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get("log-1")).toBeUndefined();
    expect(cache.get("log-2")).toBeUndefined();
  });
});