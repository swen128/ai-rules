# Google Cloud Logging API

This document provides information about the Google Cloud Logging API, specifically focusing on how to query logs and handle pagination.

## Querying Logs

The primary method for querying logs is through the `entries.list` method in the REST API, or the equivalent method in client libraries like the Node.js `@google-cloud/logging` package.

### Key Parameters for Querying Logs

When querying logs, the following parameters are important:

1. **projectId** (required): The Google Cloud project ID from which to retrieve logs.

2. **filter** (required): A filter expression that restricts the log entries returned by the API. The filter syntax follows the [Advanced Log Filters](https://cloud.google.com/logging/docs/view/advanced-queries) format.

   Example filters:
   - `severity>=ERROR` - Only logs with severity ERROR or higher
   - `resource.type="gce_instance"` - Only logs from Compute Engine instances
   - `timestamp>="2023-01-01T00:00:00Z"` - Only logs after a specific time

3. **pageSize** (optional): The maximum number of log entries to return per page. If not specified, the service may select an appropriate default, or may return fewer than the requested number of entries.

4. **pageToken** (optional): A page token received from a previous call. Provide this to retrieve the subsequent page of results.

### Pagination in Google Cloud Logging

Google Cloud Logging uses token-based pagination rather than page numbers. Here's how it works:

1. When you make an initial request, you specify a `pageSize` to limit the number of results.

2. If there are more results available than can fit in a single response, the API returns a `nextPageToken` along with the current page of results.

3. To retrieve the next page of results, you make another request with the same parameters, plus you add the `pageToken` parameter set to the `nextPageToken` value from the previous response.

4. You continue this process until you receive a response without a `nextPageToken`, which indicates that you've retrieved all available results.

Unlike some APIs, Google Cloud Logging does not support:
- Ordering results with an `orderBy` parameter (logs are typically ordered by timestamp)
- Specifying a page number directly
- Getting a total count of all matching logs without retrieving them

### Example Flow for Pagination

```typescript
async function getAllLogs(projectId: string, filter: string, pageSize = 100) {
  const logging = new Logging({ projectId });
  let allEntries: LogEntry[] = [];
  let nextPageToken: string | undefined = undefined;
  
  do {
    // Make the request with the current pageToken (undefined on first request)
    const [entries, pageToken] = await logging.getEntries({
      filter,
      pageSize,
      pageToken: nextPageToken
    });
    
    // Add the entries to our collection
    allEntries = allEntries.concat(entries);
    
    // Update the token for the next iteration
    nextPageToken = pageToken;
    
    // Continue until we don't get a nextPageToken
  } while (nextPageToken);
  
  return allEntries;
}
```

## Best Practices

1. **Use specific filters**: Narrow down your query as much as possible to improve performance and reduce costs.

2. **Use appropriate page sizes**: Choose a page size that balances between making too many API calls and retrieving too much data at once.

3. **Handle pagination properly**: Always check for and handle the `nextPageToken` to ensure you retrieve all relevant logs.

4. **Consider time ranges**: When possible, include time constraints in your filter to limit the scope of your query.

## Limitations

- There may be quotas and limits on the number of API requests and the amount of data you can retrieve.
- Very large result sets may take significant time to retrieve completely.
- Historical logs may be subject to retention policies.