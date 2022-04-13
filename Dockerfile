FROM node:16-alpine as build
ARG BUILD_CONTEXT

WORKDIR /base
COPY package.json .
COPY yarn.lock .
COPY ./packages packages
COPY ./$BUILD_CONTEXT/package.json $BUILD_CONTEXT/
RUN yarn --pure-lockfile --non-interactive
COPY ./$BUILD_CONTEXT $BUILD_CONTEXT
WORKDIR /base/$BUILD_CONTEXT
RUN yarn build

FROM build AS indexer
CMD ["yarn", "start:prod"]

FROM build AS queryNode
EXPOSE 4050
CMD ["yarn", "query-node:prod"]

FROM build AS migrate
CMD ["yarn", "create-schema"]
