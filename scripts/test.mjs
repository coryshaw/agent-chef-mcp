#!/usr/bin/env node
// Smoke test: start server.js over stdio, list tools/prompts, and call a tool (expects the no-key error without AGENT_CHEF_API_KEY).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const client = new Client({ name: "agent-chef-mcp-test", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [join(here, "..", "server.js")], env: { ...process.env } }));

const assert = (c, m) => { if (!c) { console.error("FAIL:", m); process.exit(1); } console.log("ok  ", m); };
const { tools } = await client.listTools();
assert(tools.length >= 36, `${tools.length} tools listed`);
assert(tools.every((t) => t.annotations && t.outputSchema), "every tool has annotations and an outputSchema");
const { prompts } = await client.listPrompts();
assert(prompts.length === 2, "2 prompts listed");
const r = await client.callTool({ name: "get_members", arguments: {} });
if (process.env.AGENT_CHEF_API_KEY) assert(!r.isError && r.structuredContent, "get_members returns structured content with a key");
else assert(r.isError && r.content[0].text.includes("API key"), "without a key, tool calls explain how to get one");
await client.close();
console.log("TEST OK");
