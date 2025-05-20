FROM node:latest
WORKDIR /Guild-Management-Bot
COPY package.json .
RUN npm install && npm install typescript -g
COPY . .
ENV NODE_ENV=production
RUN npm run build
CMD ["node", "./lib/src/index.js"]