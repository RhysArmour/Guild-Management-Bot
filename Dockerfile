    FROM node:latest
    WORKDIR /dev-gmb
    COPY package.json .
    RUN npm install\
        && npm install typescript -g
    COPY . .
    ENV NODE_ENV=production
    RUN npx prisma generate
    RUN npx prisma migrate deploy
    RUN npm run build
    CMD ["node", "./lib/index.js"]