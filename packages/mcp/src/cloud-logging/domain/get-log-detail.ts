import type {CloudLoggingApi} from "./api";
import type {LogCache} from "./cache";
import type {GetLogDetailInput} from "../port/getLogDetail";

export const getLogDetail = (dependencies: {
  api: CloudLoggingApi;
  cache: LogCache;
}) => (
  input: GetLogDetailInput,
): string => {
  // TODO
};
