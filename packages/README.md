# Packages (`packages/`)

This directory serves as a monorepo container for individual packages within the project. Each subdirectory represents a distinct package, likely managed using a tool like npm workspaces, pnpm workspaces, or similar monorepo management solutions.

## Architecture

The primary purpose of this directory is organization. It groups related but potentially independent modules or applications into manageable units.

-   **`mcp/`**: Contains the MCP (Model Context Protocol) server package. See [`mcp/README.md`](./mcp/README.md) for details about this package.
-   *(Other packages may reside here)*

## Files

-   **`mcp/`**: Subdirectory for the MCP server package.
-   **`README.md`**: This file.