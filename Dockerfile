# Agent Chef MCP server (stdio). Builds and runs locally; tool calls execute on the hosted service for the
# household identified by AGENT_CHEF_API_KEY. Without a key, initialize / tools/list / prompts/list still work.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js catalog.json ./
ENV AGENT_CHEF_API_KEY=""
CMD ["node", "server.js"]
