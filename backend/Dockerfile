FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY nodejsapp/package*.json ./

RUN npm install

# Bundle app source
COPY nodejsapp/ .

EXPOSE 8080
CMD [ "node", "server.js" ]