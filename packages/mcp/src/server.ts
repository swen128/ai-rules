import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCloudLoggingTools } from "./cloud-logging";

export const createServer = () => {
  const server = new McpServer({
    name: "My MCP",
    version: "1.0.0",
  });
  
  const logTools = createCloudLoggingTools();
  
  server.tool("" , logTools.queryLogs.handler)

  // TODO: Add tools
  // server.tool()

  return server;
};
