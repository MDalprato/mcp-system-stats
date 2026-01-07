import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import os from "os";

const server = new Server(
  { name: "mcp-system-stats", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// 🔹 tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_system_stats",
        description: "Gets CPU load and free RAM on macOS",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 🔹 tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_system_stats") {
    throw new Error("Unknown tool");
  }

  console.log("get_system_stats tool called");

  const loadAvg = os.loadavg();
  const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(2);
  const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);

  return {
    content: [
      {
        type: "text",
        text: `CPU load (1m): ${loadAvg[0]}
Free RAM: ${freeMemGB} GB / ${totalMemGB} GB`,
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
await new Promise(() => {});
