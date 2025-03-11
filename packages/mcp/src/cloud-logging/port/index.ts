import { CloudLoggingApi } from "../domain/api";
import { LogCache } from "../domain/cache";
import { getLogDetailTool } from "./getLogDetail";
import { queryLogsTool } from "./queryLogs";

export const createTools = (dependencies: {
  api: CloudLoggingApi;
  cache: LogCache;
}) => {
  return {
    queryLogs: queryLogsTool(dependencies),
    getLogDetail: getLogDetailTool(dependencies),
  };
};
