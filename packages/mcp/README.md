# MCP Package (`packages/mcp/`)

This package contains the implementation of an MCP (Model Context Protocol) server. It provides tools and resources, potentially interacting with external services like Google Cloud Logging, for use by AI agents or other MCP clients.

## Architecture

This package is structured to separate concerns and manage different aspects of the MCP server:

-   **`src/`**: Contains the core source code for the server, including the main entry point, server setup, feature implementations (like Cloud Logging), and utility functions. See [`src/README.md`](./src/README.md) for its internal structure.
-   **`docs/`**: Holds supplementary documentation files related to the package or its features. See [`docs/README.md`](./docs/README.md) for details.
-   **`package.json`**: Defines package metadata, dependencies, and scripts.
-   **`tsconfig.json`**: TypeScript configuration for the package.
-   **`README.md`**: This file, providing an overview of the package.

## Features

Currently, the primary feature implemented is related to Google Cloud Logging, allowing clients to query logs and retrieve details. See [`src/cloud-logging/README.md`](./src/cloud-logging/README.md) for more information on this feature.

## Usage

This package is intended to be run as an MCP server process. Configuration details for connecting clients can typically be found in the feature-specific documentation (e.g., the Installation section in `src/cloud-logging/README.md`).