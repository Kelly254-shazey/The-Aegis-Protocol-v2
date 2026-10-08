FROM node:20-alpine

WORKDIR /app

# Zero external npm dependencies required — uses Node.js standard runtime
COPY server.js .

ENV PORT=3888
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3888

# Healthcheck probe every 15s to keepalive
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3888/api/health || exit 1

CMD ["node", "server.js"]
