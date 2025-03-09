import {createCloudLoggingServer} from "./cloud-logging/cloud-logging";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

if (import.meta.main) {
  const server = createCloudLoggingServer();
  const transport = new StdioServerTransport();

  // Handle errors
  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });

  // Connect the server to the transport
  server.connect(transport).catch((error) => {
    console.error("Failed to connect server:", error);
    process.exit(1);
  });

  console.error("Cloud Logging MCP server running on stdio");
}
