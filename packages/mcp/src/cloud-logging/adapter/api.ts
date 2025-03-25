import { Logging } from "@google-cloud/logging";
import { err, ok, Result } from "neverthrow";
import { CloudLoggingError } from "../domain/types";
import { RawLogEntry } from "../domain/log-entry";
import { LogId, createLogId } from "../domain/log-id";
import { CloudLoggingApi } from "../domain/api";

/**
 * Implementation of Cloud Logging adapter using Google Cloud Logging client
 */
export class GoogleCloudLoggingApiClient implements CloudLoggingApi {
  /**
   * Creates a new GoogleCloudLoggingAdapter
   */
  constructor() {}

  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Result with entries and nextPageToken, or error
   */
  async entries(params): Promise<
    Result<
      {
        entries: RawLogEntry[];
        nextPageToken?: string;
      },
      CloudLoggingError
    >
  > {
    try {
      const { projectId } = params;

      // TODO: Avoid instantiating Logging client for each request.
      const logging = new Logging();

      // Build the query options
      const options = buildQueryOptions(params);

      // Execute the query
      const [entries, nextPageToken] = await logging.getEntries(options);

      // Convert entries to RawLogEntry in a type-safe way
      const typedEntries: RawLogEntry[] = entries.map((entry) => {
        // Create a new object with string keys and unknown values
        const rawEntry: Record<string, unknown> = {};
        const json = entry.toJSON();

        // Copy all properties from json to rawEntry
        // Using type assertion only for this internal conversion
        const jsonObj = json as unknown as Record<string, unknown>;
        Object.keys(jsonObj).forEach((key) => {
          rawEntry[key] = jsonObj[key];
        });

        // Ensure insertId is present
        if (!rawEntry.insertId) {
          rawEntry.insertId = createLogId(
            `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          );
        } else {
          // Make sure insertId is a LogId
          rawEntry.insertId = createLogId(String(rawEntry.insertId));
        }

        return rawEntry as RawLogEntry;
      });

      return ok({
        entries: typedEntries,
        nextPageToken: nextPageToken ? String(nextPageToken) : undefined,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return err({
        message: errorMessage,
        code:
          error instanceof Error && "code" in error
            ? (error as unknown as { code: CloudLoggingError["code"] }).code
            : undefined,
      });
    }
  }
}
