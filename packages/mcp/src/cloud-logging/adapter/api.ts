import type { Result } from "neverthrow";
import type { CloudLoggingApi, CloudLoggingQuery, RawLogEntry } from "../domain/api";
import type { CloudLoggingError } from "../domain/api";

export class GoogleCloudLoggingApiClient implements CloudLoggingApi {
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
