# syntax=docker/dockerfile:1

# Start your image with a node base image
FROM node:latest

# Create an application directory
RUN mkdir -p /usr/src/bot

# Set the /app directory as the working directory for any command that follows
WORKDIR /usr/src/bot

# Copy the local app package and package-lock.json file to the container
COPY package.json /usr/src/bot
RUN npm install

# Copy local directories to the working directory of our docker image (/app)
COPY . /usr/src/bot

# Start the app using serve command
CMD ["node", "index.js"]