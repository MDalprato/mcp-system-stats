#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import os from "os";

const server = new Server(
  {
    name: "mcp-system-stats",
    version: "0.1.0",
  },
  {
    tools: {
      get_system_stats: {
        description: "Ottiene carico CPU e RAM libera su macOS",
        inputSchema: {
          type: "object",
          properties: {},
        },
        handler: async () => {
          const loadAvg = os.loadavg();
          const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(2);
          const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);

          return {
            content: [
              {
                type: "text",
                text: `CPU load (1m): ${loadAvg[0]}
RAM libera: ${freeMemGB} GB / ${totalMemGB} GB`,
              },
            ],
          };
        },
      },
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);