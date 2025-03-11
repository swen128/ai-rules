import { GoogleCloudLoggingApiClient } from "./adapter/api";
import { LogCacheImpl } from "./adapter/cache";
import { createTools } from "./port";

export const createCloudLoggingTools = () => {
  const api = new GoogleCloudLoggingApiClient();
  const cache = new LogCacheImpl();

  return createTools({ api, cache });
};
