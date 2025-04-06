import type { GetLogDetailInput } from "../port/getLogDetail";
import type { CloudLoggingApi } from "./api";
import type { LogCache } from "./cache";

export const getLogDetail =
  (dependencies: {
    api: CloudLoggingApi;
    cache: LogCache;
  }) =>
  (input: GetLogDetailInput): string => {
    // TODO
  };
