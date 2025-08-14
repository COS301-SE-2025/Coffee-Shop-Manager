# Stage: Dependencies
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage: Builder (prod)
FROM node:20 AS builder
WORKDIR /app
ARG NEXT_PUBLIC_FE_URL
ENV NEXT_PUBLIC_FE_URL=${NEXT_PUBLIC_FE_URL:-https://api.diekoffieblik.co.za}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage: Runner (prod)
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]

# Stage: Dev
FROM node:20 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
