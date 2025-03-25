import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const createServer = () => {
  const server = new McpServer({
    name: "My MCP",
    version: "1.0.0",
  });

  // TODO: Add tools
  // server.tool()

  return server;
};
