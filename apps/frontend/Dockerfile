FROM node:20-alpine AS deps
WORKDIR /app/apps/frontend
COPY apps/frontend/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app/apps/frontend
COPY --from=deps /app/apps/frontend/node_modules ./node_modules
COPY apps/frontend ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/apps/frontend
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/apps/frontend ./
EXPOSE 3000
CMD ["npm", "run", "start"]
