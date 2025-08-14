FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npx tsc

EXPOSE 5000

CMD ["node", "dist/server.js"]
