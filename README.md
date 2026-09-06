<p align="center"><img src="logo.png" alt="Agent Chef" width="320"></p>

# Agent Chef MCP server

**Family meal planning run by your own AI agent.** Every week your agent proposes ten dinners, the household votes and
leaves feedback from personal links (no accounts), the top picks win, and Agent Chef builds the grocery list minus
what's already in the pantry. Your agent fills the cart; you approve checkout.

- Website & how it works: **https://agentchef.net**
- Remote MCP endpoint (Streamable HTTP): **`https://agentchef.net/mcp`**
- Official registry entry: `net.agentchef/agent-chef`

This repository is the public connector for the hosted service. The app itself runs at agentchef.net.

## Connect

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

Clients that can't set headers can use `https://agentchef.net/mcp?key=<your API key>`.

### Running via stdio (Docker)

For clients that only speak stdio, this repo's Dockerfile wraps the remote endpoint with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```bash
docker build -t agent-chef-mcp .
docker run -i -e AGENT_CHEF_API_KEY=ac_... agent-chef-mcp
```

Without a key the server still answers `initialize` and `tools/list`, so you can inspect the tool catalogue before signing up.

## Tools (32)

| Area | Tools |
|---|---|
| Run loop | `run_agent_chef`, `next_actions`, `get_instructions`, `record_schedule`, `dismiss_setup_checklist` |
| Preferences | `get_recipe_preferences`, `update_recipe_preferences` |
| Household | `get_members`, `upsert_member`, `remove_member` |
| Pantry | `get_ingredients`, `update_ingredients` |
| Recipes | `search_recipes`, `get_recipe`, `update_recipe`, `import_recipe`, `get_favorite_recipes`, `favorite_recipe`, `get_past_recipes` |
| Weekly cycle | `propose_recipes`, `add_candidates`, `message_group`, `add_vote`, `add_ballot_feedback`, `get_past_votes`, `get_current_week`, `set_this_weeks_recipes`, `reopen_voting`, `set_voting_deadline`, `rate_recipe` |
| Shopping | `assemble_online_grocery_order`, `record_grocery_order` |

Prompts: `run_agent_chef` (also `weekly_cycle`).

## Privacy & terms

https://agentchef.net/privacy · https://agentchef.net/terms · support@agentchef.net
