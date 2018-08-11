FROM node:8

ENV NODE_ENV production
ENV PORT 8080
ENV NODE_URL https://api-scilla.zilliqa.com
ENV PRIVATE_KEY ...
ENV UI_BUILD_PATH /zilliqa-faucet-ui

COPY ./src/server /zilliqa-faucet-api
COPY ./package.json /zilliqa-faucet-api
COPY ./build /zilliqa-faucet-ui

WORKDIR /zilliqa-faucet-api

RUN npm install --production