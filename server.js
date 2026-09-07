#!/usr/bin/env node
// Agent Chef MCP server (stdio). Runs locally for clients that only speak stdio, or for directories that
// build and test servers in a container. The tool catalog ships with the package (catalog.json), so
// initialize / tools/list / prompts/list work offline. Tool calls are executed by the hosted service at
// https://agentchef.net/mcp on behalf of the household identified by AGENT_CHEF_API_KEY.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, "catalog.json"), "utf8"));
const REMOTE = process.env.AGENT_CHEF_URL ?? "https://agentchef.net/mcp";
const KEY = (process.env.AGENT_CHEF_API_KEY ?? "").trim();

const NO_KEY = `Agent Chef needs an API key to act on a household. Sign in at https://agentchef.net, open Settings → Agents, create a key, and start this server with AGENT_CHEF_API_KEY=ac_... (free trial, no card). Alternatively connect https://agentchef.net/mcp directly with OAuth in clients that support it.`;

const server = new Server({ name: catalog.server?.name ?? "agent-chef", version: catalog.server?.version ?? "0.0.0" }, {
  capabilities: { tools: {}, prompts: {} },
  instructions: catalog.instructions,
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: catalog.tools }));
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: catalog.prompts }));

server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  const p = catalog.prompts.find((x) => x.name === req.params.name);
  if (!p) throw new Error(`Unknown prompt ${req.params.name}`);
  return { description: p.description, messages: [{ role: "user", content: { type: "text", text: `${catalog.instructions}\n\nNow run the loop: call next_actions and execute what it returns.` } }] };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (!catalog.tools.some((t) => t.name === req.params.name)) return { isError: true, content: [{ type: "text", text: `Unknown tool ${req.params.name}` }] };
  if (!KEY) return { isError: true, content: [{ type: "text", text: NO_KEY }] };
  let res;
  try {
    res = await fetch(REMOTE, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: req.params }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    return { isError: true, content: [{ type: "text", text: `Could not reach ${REMOTE}: ${e.message}` }] };
  }
  if (res.status === 401) return { isError: true, content: [{ type: "text", text: `Agent Chef rejected the API key (401). Create a new one at https://agentchef.net/app/settings/agents and restart with AGENT_CHEF_API_KEY set.` }] };
  const body = await res.json().catch(() => null);
  if (!body) return { isError: true, content: [{ type: "text", text: `Agent Chef returned HTTP ${res.status} with a non-JSON body.` }] };
  if (body.error) return { isError: true, content: [{ type: "text", text: body.error.message ?? JSON.stringify(body.error) }] };
  return body.result;
});

await server.connect(new StdioServerTransport());
