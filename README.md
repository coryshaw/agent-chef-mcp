<p align="center"><img src="https://raw.githubusercontent.com/coryshaw/agent-chef-mcp/main/logo.png" alt="Agent Chef" width="320"></p>

# Agent Chef MCP server

**Family meal planning run by your own AI agent.** Every week your agent proposes ten dinners, the household votes and
leaves feedback from personal links (no accounts), the top picks win, and Agent Chef builds the grocery list minus
what's already in the pantry. Your agent fills the cart; you approve checkout.

- Website & how it works: **https://agentchef.net**
- Remote MCP endpoint (Streamable HTTP): **`https://agentchef.net/mcp`**
- Official registry entry: `net.agentchef/agent-chef`

This repository is the public connector for the hosted service. The app itself runs at agentchef.net.

## Connect

**OAuth (Claude.ai, ChatGPT, Claude Desktop):** add `https://agentchef.net/mcp` as a custom connector. The client discovers Agent Chef's authorization server, you sign in once and click **Allow**. No key needed.

**API key (Claude Code, Cursor, Codex, scripts):**

1. Sign in at https://agentchef.net, create your household, and open **Settings → Agents**.
2. Click **Add to Claude / Add to ChatGPT / Claude Code / Cursor**. You get an API key and exact steps for that agent.
3. Tell your agent: **“Run Agent Chef.”** It calls `run_agent_chef`, receives the operating manual plus today's
   checklist, schedules itself to run twice a day, and takes it from there.

Manual configuration for any MCP client:

```json
{
  "mcpServers": {
    "agent-chef": {
      "url": "https://agentchef.net/mcp",
      "headers": { "Authorization": "Bearer <your API key>" }
    }
  }
}
```

Clients that can't set headers can use `https://agentchef.net/mcp?key=<your API key>`. OAuth discovery lives at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server`.

### Running locally over stdio

For clients that only speak stdio (and for directories that build servers in a container), this repo is a small Node
MCP server. It ships the full tool catalog, so `initialize`, `tools/list` and `prompts/list` work offline; tool calls run
on the hosted service for the household identified by `AGENT_CHEF_API_KEY`.

```bash
npx -y agent-chef-mcp                          # or: git clone … && npm install && npm start
AGENT_CHEF_API_KEY=ac_... node server.js
```

Docker:

```bash
docker build -t agent-chef-mcp .
docker run -i -e AGENT_CHEF_API_KEY=ac_... agent-chef-mcp
```

Client config for stdio:

```json
{
  "mcpServers": {
    "agent-chef": {
      "command": "npx",
      "args": ["-y", "agent-chef-mcp"],
      "env": { "AGENT_CHEF_API_KEY": "ac_..." }
    }
  }
}
```

Without a key the server still lists everything; tool calls return a message explaining where to get a key.
`npm run sync` refreshes `catalog.json` from the live server; `npm test` runs a stdio smoke test.

## Tools (37)

| Area | Tools |
|---|---|
| Run loop | `run_agent_chef`, `next_actions`, `get_instructions`, `record_schedule`, `dismiss_setup_checklist` |
| Access | `get_connected_agents`, `revoke_connected_agent` |
| Preferences | `get_recipe_preferences`, `update_recipe_preferences` |
| Household | `get_members`, `upsert_member`, `remove_member` |
| Pantry | `get_ingredients`, `update_ingredients` |
| Recipes | `search_recipes`, `get_recipe`, `update_recipe`, `import_recipe`, `import_recipes`, `create_recipe`, `set_recipe_image`, `get_favorite_recipes`, `favorite_recipe`, `get_past_recipes` |
| Weekly cycle | `propose_recipes`, `add_candidates`, `message_group`, `add_vote`, `add_ballot_feedback`, `get_past_votes`, `get_current_week`, `set_this_weeks_recipes`, `reopen_voting`, `set_voting_deadline`, `rate_recipe` |
| Shopping | `assemble_online_grocery_order`, `record_grocery_order` |

Prompts: `run_agent_chef` (also `weekly_cycle`).

## Privacy & terms

https://agentchef.net/privacy · https://agentchef.net/terms · support@agentchef.net
