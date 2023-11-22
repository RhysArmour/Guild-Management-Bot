    FROM node:latest
    WORKDIR /guild-management-bot
    COPY package.json .
    RUN npm install\
        && npm install typescript -g
    COPY . .
    ENV NODE_ENV=production
    RUN npx prisma generate
    RUN npm run build
    CMD ["node", "./lib/index.js"]
