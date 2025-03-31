# MCP Server Source (`packages/mcp/src/`)

This directory contains the core source code for the MCP (Model Context Protocol) server. It orchestrates the different features (like Cloud Logging) and utilities, and sets up the server instance.

## Architecture

The top level of the `src` directory is responsible for initializing and running the MCP server:

-   **Server Initialization (`server.ts`)**: Defines a `createServer` function that instantiates the main `McpServer` object using the `@modelcontextprotocol/sdk`. This is where different tools and resources provided by the server's features (e.g., from `cloud-logging/`) would typically be registered using `server.tool()` or `server.resource()`. *(Note: Currently, `server.ts` appears to be a basic setup without tool registration completed).*
-   **Entry Point (`main.ts`)**: Acts as the executable entry point for the server. It calls `createServer` to get the server instance and then uses a transport mechanism (currently `StdioServerTransport` from the SDK) to make the server listen for connections, likely over standard input/output.
-   **Feature Modules (e.g., `cloud-logging/`)**: Subdirectories like `cloud-logging/` contain specific features offered by the MCP server. They follow their own internal architecture (often Ports & Adapters) and expose tools/resources to be registered in `server.ts`. See [`cloud-logging/README.md`](./cloud-logging/README.md) for its specific architecture.
-   **Utilities (`util/`)**: Contains shared, general-purpose functions used across different parts of the server. See [`util/README.md`](./util/README.md) for details.

## Files

-   **`main.ts`**: The main executable script that starts the server.
-   **`server.ts`**: Defines the function to create and configure the `McpServer` instance.
-   **`cloud-logging/`**: Directory containing the Cloud Logging feature.
-   **`util/`**: Directory containing utility functions.
-   **`README.md`**: This file.

This structure separates the server setup and execution logic from the specific features it provides.