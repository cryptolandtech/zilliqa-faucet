# Zilliqa Faucet

Small app to help developer or people, interested in testing Zilliqa blockchain, get some ZILs on Testnet.

## Architecture
The app is basically a preact app that uses material web components and a Firebase cloud function as an API.

## Project setup
Install dependencies
``` bash
npm install
```

Create a `.env` file in project root, using this example:
```
NODE_URL=https://api-scilla.zilliqa.com
PRIVATE_KEY=<add private key for faucet wallet here>
RECAPTCHA_SECRET=<add recaptcha secret here>
```

Run the project
``` bash
npm run dev
```

The project will start on port 8080. http://localhost:8080/

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev:ui # will start the preact app
npm run dev:api # will start the api part of the app

npm run dev # will run ui and api in dev mode in parallel (with file watch)

# build for production
npm run build:ui # will build ui app for production
npm run build # will build a docker image with api and ui builtin

# test the production build locally
npm run serve
```

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
