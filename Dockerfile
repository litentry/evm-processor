FROM node:16-alpine as node
RUN apk --no-cache add --virtual .builds-deps build-base python3

# build everything in /base
WORKDIR /base
COPY package.json .
COPY yarn.lock .
COPY ./packages packages
COPY ./indexers indexers
RUN yarn --pure-lockfile --non-interactive

FROM node AS archive
WORKDIR /base/indexers/archive
EXPOSE 4050
CMD ["yarn", "start:prod"]

FROM node AS token-contracts
WORKDIR /base/indexers/token-contracts
EXPOSE 4051
CMD ["yarn", "start:prod"]

FROM node AS token-activity
WORKDIR /base/indexers/token-activity
EXPOSE 4052
CMD ["yarn", "start:prod"]
