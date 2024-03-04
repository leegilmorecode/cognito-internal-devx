# Central Auth Service DevX

![image](./docs/images/header.png)

How we can create an internal platform for managing external clients with M2M flows in Amazon Cognito, with full example written in TypeScript and the AWS CDK.

## Getting Started

### Deploy Central Auth Service

To deploy the central auth service:

1. CD into `shared-central-auth`.
2. Run `npm run deploy:stateful` in the terminal.
3. Run `npm run deploy:stateless` in the terminal.
4. CD into the `client` folder up one level and change the API on line 5 in the file `shared-central-auth/client/src/App.tsx` to match the deployed API in the stateless stack.
5. In the same client folder run `npm run start` to fire up the client app.

> At this point you can use the UI to create a resource server, client and scopes.

### Deploy Resource Server Service

1. CD into the `resource-server-service` folder.
2. In the file `src/config/config.ts` add the relevant information to config.
3. Run `npm run deploy` in the terminal.

### Deploy Client Service

To deploy the client service:

1. CD into the `client-service` folder.
2. In the `config.ts` file change the config values to match the ones created through the UI.
3. Run `npm run deploy` in the terminal.

## Tearing down the stacks

Please run the relevnt `npm run remove` npm scrips in the folders in the reverse order as the deploy.
