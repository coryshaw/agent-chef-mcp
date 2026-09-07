#!/usr/bin/env node
// Refresh catalog.json from the live Agent Chef server. Run: node scripts/sync-catalog.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.AGENT_CHEF_URL ?? "https://agentchef.net/mcp";
const rpc = async (method, params = {}) => {
  const res = await fetch(`${BASE}?introspect=1`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
};

const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "sync-catalog", version: "1.0.0" } });
const { tools } = await rpc("tools/list");
const { prompts } = await rpc("prompts/list");
const catalog = {
  synced_at: new Date().toISOString(),
  server: init.serverInfo,
  instructions: init.instructions ?? "",
  tools,
  prompts,
};
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "catalog.json");
writeFileSync(out, JSON.stringify(catalog, null, 2) + "\n");
console.log(`catalog.json: ${tools.length} tools, ${prompts.length} prompts, server ${init.serverInfo?.version}`);
