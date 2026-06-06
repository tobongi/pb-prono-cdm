FROM node:22-alpine AS builder
WORKDIR /app

# Copy proxy source (standalone package — no workspace deps)
COPY apps/proxy/package.json ./package.json
COPY apps/proxy/tsconfig.json ./tsconfig.json
COPY apps/proxy/src ./src

# Install deps (no lockfile needed — package.json is self-contained)
RUN npm install --omit=dev=false

# Build TypeScript
RUN npx tsc

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
