import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCloudLoggingTools } from "./cloud-logging/index.js"; // Use index.js for clarity

export const createServer = () => {
  const server = new McpServer({
    name: "My MCP",
    version: "1.0.0",
  });

  const cloudLoggingTools = createCloudLoggingTools();
  
  for (const {name, description, handler, inputSchema} of cloudLoggingTools) {
    server.tool(name, description, inputSchema, handler)
  }

  return server;
};
