FROM node:10-alpine
WORKDIR /home/node/app
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
COPY . .
CMD node index.js
