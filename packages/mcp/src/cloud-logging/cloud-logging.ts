import {Tool} from "@mizchi/mcp-helper";
import {CloudLoggingServiceImpl} from "./service";
import {GoogleCloudLoggingApiClient} from "./api";
import {LogCacheImpl} from "./cache";

const tool: Tool = {
  name: "Google Cloud Logging",
  description: "",
  inputSchema:,
  outputSchema:,
};

const handlers = () => {
  const api = new GoogleCloudLoggingApiClient();
  const cache = new LogCacheImpl();
  const service = new CloudLoggingServiceImpl(cache, api);
  
  return {
    // TODO 
  }
}
  