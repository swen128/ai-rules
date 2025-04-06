import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCloudLoggingTools } from "./cloud-logging";

export const createServer = () => {
  const server = new McpServer({
    name: "My MCP",
    version: "1.0.0",
  });

  const { queryLogs, getLogDetail } = createCloudLoggingTools();

  // TODO: Make this DRY
  server.tool(
    queryLogs.name,
    queryLogs.description,
    { input: queryLogs.inputSchema },
    queryLogs.handler,
  );
  server.tool(
    getLogDetail.name,
    getLogDetail.description,
    { input: getLogDetail.inputSchema },
    getLogDetail.handler,
  );

  return server;
};
