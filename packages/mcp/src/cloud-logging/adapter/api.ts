import type { Result } from "neverthrow";
import type { CloudLoggingApi, CloudLoggingQuery } from "../domain/api";
import type { RawLogEntry } from "../domain/log-entry";
import type { CloudLoggingError } from "../domain/api";

/**
 * Implementation of Cloud Logging adapter using Google Cloud Logging client
 */
export class GoogleCloudLoggingApiClient implements CloudLoggingApi {
  /**
   * Queries logs from Cloud Logging
   * @param params Query parameters
   * @returns Result with entries and nextPageToken, or error
   */
  async entries(params: CloudLoggingQuery): Promise<
    Result<
      {
        entries: RawLogEntry[];
        nextPageToken?: string;
      },
      CloudLoggingError
    >
  > {
    // TODO: Implement this
  }
}
