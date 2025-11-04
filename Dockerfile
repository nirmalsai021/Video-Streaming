# Multi-stage build for production
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --production

FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=client-build /app/client/build ./server/public
EXPOSE 4000
CMD ["node", "server/server.js"]