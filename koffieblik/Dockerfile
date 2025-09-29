# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_PUBLIC_API_URL=https://api.diekoffieblik.co.za
ENV NODE_OPTIONS="--max-old-space-size=1024"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
