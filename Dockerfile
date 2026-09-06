# Thin stdio wrapper around the hosted Agent Chef MCP server (https://agentchef.net/mcp).
# Set AGENT_CHEF_API_KEY to act on a household; without it only initialize/tools/list work.
FROM node:22-alpine
RUN npm install -g mcp-remote@latest
ENV AGENT_CHEF_API_KEY=""
ENTRYPOINT ["sh", "-c", "if [ -n \"$AGENT_CHEF_API_KEY\" ]; then exec mcp-remote https://agentchef.net/mcp --header \"Authorization:Bearer ${AGENT_CHEF_API_KEY}\"; else exec mcp-remote https://agentchef.net/mcp; fi"]
