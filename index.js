#!/usr/bin/env node
// Shebang: allows this file to be executed directly as a CLI script
// (e.g. ./index.js) using the system-installed Node.js runtime.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// Imports the MCP Server class.
// This is the core object that implements the Model Context Protocol:
// handshake, tool registration, and message routing.

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// Imports the stdio transport.
// Claude Desktop communicates with MCP servers via stdin/stdout,
// not via HTTP or sockets.

import os from "os";
// Node.js built-in module that exposes operating system information
// such as CPU load, memory usage, uptime, etc.


// Create the MCP server instance
const server = new Server(
  {
    name: "mcp-system-stats",
    version: "0.1.0",
    // Server metadata.
    // Claude uses this information during initialization
    // to identify the server and its version.
  },
  {
    tools: {
      // Definition of the tools exposed by this MCP server
      get_system_stats: {
        description: "Gets CPU load and free RAM on macOS",
        // Natural-language description.
        // Claude uses this to decide WHEN this tool is relevant.

        inputSchema: {
          type: "object",
          properties: {},
        },
        // JSON Schema describing the tool input.
        // Empty object = no parameters required.

        handler: async () => {
          // This function is executed ONLY when Claude calls the tool.
          // If this code runs, the tool is definitely being used.

          console.log("get_system_stats tool called");
          // Visible proof in logs that Claude invoked this tool.

          const loadAvg = os.loadavg();
          // Returns an array: [1min, 5min, 15min] CPU load averages.
          // On macOS, load average is the standard CPU load metric.

          const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(2);
          const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);
          // Free and total memory converted from bytes to gigabytes.

          return {
            content: [
              {
                type: "text",
                // MCP responses are structured as content blocks.
                // "text" is the simplest and most common type.

                text: `CPU load (1m): ${loadAvg[0]}
Free RAM: ${freeMemGB} GB / ${totalMemGB} GB`,
                // This text is what Claude receives and uses
                // to compose the final answer to the user.
              },
            ],
          };
        },
      },
    },
  }
);


// Create the stdio transport (stdin/stdout communication)
const transport = new StdioServerTransport();

// Connect the server to the transport.
// This performs the MCP handshake with Claude Desktop.
await server.connect(transport);

// Keep the Node.js process alive indefinitely.
// Without this, the process would exit after initialization,
// causing Claude to see "Server disconnected".
await new Promise(() => {});
