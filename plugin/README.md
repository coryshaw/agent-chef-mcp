# Agent Chef

Family meal planning run by your own AI agent. Say "Run Agent Chef" and your assistant proposes the week's dinners,
built mostly from what your household already cooks, then sends everyone a personal voting link. The top picks win,
and the grocery list is assembled minus what's already in the pantry. Your agent can fill the online cart; checkout
always waits for you.

## What's in the plugin

- **Connector**: the Agent Chef MCP server at `https://agentchef.net/mcp`. Sign in with your Agent Chef account
  through OAuth when you connect it; a free trial starts on sign-up and no card is needed.
- **Skill** (`/agent-chef:run`): the operating procedure for the weekly loop, so the agent knows the order of
  operations, how to build a ballot around your regular rotation, and where to stop for approval.

## Use it

1. Connect the Agent Chef connector and sign in.
2. Add your household members under Settings, or tell the agent their names.
3. Say "Run Agent Chef." The agent proposes ten dinners and sends the ballot. Everyone votes from their phone.
4. Ask it to run again after voting closes, or let it schedule itself twice a day.

## Data

The plugin sends your household's meal-planning data (preferences, recipes, votes, comments, ratings, pantry and
member names with any contact details you enter) to agentchef.net, and nowhere else. Agent Chef stores it to run
your household's planning; there is no advertising, no sale of data and no model training. See
https://agentchef.net/privacy and https://agentchef.net/terms. The plugin itself stores nothing and runs no local
code.
