    FROM node:latest
    WORKDIR /dev-gmb
    COPY package.json .
    RUN npm install\
        && npm install typescript -g
    COPY . .
    ENV NODE_ENV=production
    ENV DATABASE_URL=postgres://devgmb:EiBlCXR8e10YC6k@devgmb-db.flycast:5432/devgmb?sslmode=disable
    RUN npx prisma generate
    RUN npm run build
    RUN npx prisma migrate resolve --applied 20231110151830_username_mandatory
    CMD ["node", "./lib/index.js"]
