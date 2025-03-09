/**
 * Pure utility functions for Cloud Logging MCP server
 */

/**
 * Extracts a value from an object using a dot-notation path
 * @param obj The object to extract from
 * @param path The path in dot notation (e.g., "labels.service")
 * @returns The extracted value or undefined if not found
 */
export function getValueByPath(obj: Record<string, unknown>, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Builds query options for Cloud Logging
 * @param params Query parameters
 * @returns Query options object
 */
export function buildQueryOptions(params: {
  filter: string;
  resourceNames?: string[];
  pageSize?: number;
  pageToken?: string;
  orderBy?: { timestamp: "asc" | "desc" };
}): Record<string, any> {
  const {
    filter,
    resourceNames,
    pageSize = 10,
    pageToken,
    orderBy
  } = params;

  const options: Record<string, any> = {
    filter,
    pageSize
  };

  if (resourceNames && resourceNames.length > 0) {
    options.resourceNames = resourceNames;
  }

  if (pageToken) {
    options.pageToken = pageToken;
  }

  if (orderBy) {
    options.orderBy = `timestamp ${orderBy.timestamp}`;
  }

  return options;
}

/**
 * Creates an error response
 * @param error The error object
 * @returns An error object with message and optional code
 */
export function createErrorResponse(error: unknown): {
  error: {
    message: string;
    code?: string;
  }
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    error: {
      message: errorMessage,
      code: (error as any).code
    }
  };
}