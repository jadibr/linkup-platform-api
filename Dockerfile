FROM node:current-alpine as builder

WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
ARG ENV
RUN npm run build:${ENV}
RUN npm prune --production

FROM node:current-alpine

WORKDIR /usr/src/linkup-platform-api

COPY package*.json ./
COPY --from=builder build/node_modules ./node_modules
COPY --from=builder build/dist .

EXPOSE 6014
CMD [ "node", "./server.js" ]