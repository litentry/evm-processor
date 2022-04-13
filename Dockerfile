FROM node:16-alpine as node
ARG BUILD_CONTEXT
WORKDIR /base
COPY package.json .
COPY yarn.lock .
COPY ./packages packages
COPY ./$BUILD_CONTEXT/package.json $BUILD_CONTEXT/
RUN yarn --pure-lockfile --non-interactive
COPY ./$BUILD_CONTEXT $BUILD_CONTEXT
WORKDIR /base/$BUILD_CONTEXT


FROM node as build
RUN yarn build

FROM node as indexerBuild
RUN yarn codegen
RUN yarn build


FROM build AS archiver
CMD ["yarn", "start:prod"]

FROM build AS archiveQueryNode
EXPOSE 4050
CMD ["yarn", "query-node:prod"]



FROM indexerBuild AS migrate
CMD ["yarn", "migrate"]

FROM indexerBuild AS indexer
CMD ["yarn", "start:prod"]

FROM indexerBuild AS indexQueryNode
EXPOSE 80
CMD ["yarn", "query-node:prod"]