# Stage: Dependencies
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage: Builder (prod)
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./Prediction ./Prediction
RUN npx tsc

# Stage: Runner (prod)
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y python3 python3-pip python3-requests && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/Prediction ./Prediction
EXPOSE 5000
CMD ["node", "dist/server.js"]

# Stage: Dev
FROM node:20 AS dev
WORKDIR /app
RUN apt-get update && apt-get install -y python3 python3-pip python3-requests && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npx", "ts-node", "src/server.ts"]
