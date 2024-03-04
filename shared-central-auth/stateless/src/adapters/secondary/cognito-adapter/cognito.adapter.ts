import {
  CognitoIdentityProviderClient,
  CreateResourceServerCommand,
  CreateResourceServerCommandInput,
  CreateResourceServerCommandOutput,
  CreateUserPoolClientCommand,
  CreateUserPoolClientCommandInput,
  CreateUserPoolClientCommandOutput,
  DeleteResourceServerCommand,
  DeleteResourceServerCommandInput,
  DeleteUserPoolClientCommand,
  DeleteUserPoolClientCommandInput,
  DescribeUserPoolClientCommand,
  DescribeUserPoolClientCommandInput,
  DescribeUserPoolClientCommandOutput,
  ListResourceServersCommand,
  ListResourceServersCommandInput,
  ListResourceServersCommandOutput,
  ListUserPoolClientsCommand,
  ListUserPoolClientsCommandInput,
  ListUserPoolClientsCommandOutput,
  ResourceServerScopeType,
  ResourceServerType,
  UpdateUserPoolClientCommand,
  UpdateUserPoolClientCommandInput,
  UpdateUserPoolClientCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

import { Client } from '@dto/client';
import { CreatedClient } from '@dto/created-client/created-client';
import { ResourceServer } from '@dto/resource-server';
import { config } from '@config';
import { logger } from '@shared';

const client = new CognitoIdentityProviderClient();
const userPoolId = config.get('userPoolId');

export async function listResourceServers(): Promise<ResourceServer[]> {
  const params: ListResourceServersCommandInput = {
    UserPoolId: userPoolId,
    MaxResults: 50,
  };

  try {
    const command = new ListResourceServersCommand(params);
    const response: ListResourceServersCommandOutput = await client.send(
      command
    );
    logger.info('resource servers: ', JSON.stringify(response.ResourceServers));

    if (!response.ResourceServers) return [];

    return response.ResourceServers.map((resourceServer) => {
      return {
        identifier: resourceServer?.Identifier as string,
        name: resourceServer?.Name as string,
        scopes: resourceServer?.Scopes?.map((scope) => {
          return {
            scopeDescription: scope.ScopeDescription,
            scopeName: scope.ScopeName,
          };
        }),
        userPoolId: resourceServer?.UserPoolId as string,
      };
    });
  } catch (error) {
    logger.error('error listing resource servers: ', JSON.stringify(error));
    throw error;
  }
}

export async function createCognitoResourceServer(
  resourceServerName: string,
  identifier: string,
  scopes: ResourceServerScopeType[]
): Promise<ResourceServerType> {
  const params: CreateResourceServerCommandInput = {
    UserPoolId: userPoolId,
    Identifier: identifier,
    Name: resourceServerName,
    Scopes: scopes,
  };

  try {
    const command = new CreateResourceServerCommand(params);
    const response: CreateResourceServerCommandOutput = await client.send(
      command
    );

    logger.info(
      'resource server created: ',
      JSON.stringify(response.ResourceServer)
    );
    const resourceServer = response.ResourceServer;

    if (!resourceServer) {
      throw new Error('resource server could not be created');
    }

    logger.info('resource server details: ', JSON.stringify(resourceServer));
    return resourceServer;
  } catch (error) {
    logger.error('error creating resource server: ', JSON.stringify(error));
    throw error;
  }
}

export async function createCognitoUserPoolClient(
  clientName: string,
  scopes: string[],
  generateSecret: boolean = true
): Promise<CreatedClient> {
  const params: CreateUserPoolClientCommandInput = {
    UserPoolId: userPoolId,
    ClientName: clientName,
    GenerateSecret: generateSecret,
    AllowedOAuthScopes: scopes,
    SupportedIdentityProviders: ['COGNITO'],
    ExplicitAuthFlows: ['ALLOW_REFRESH_TOKEN_AUTH'],
    AllowedOAuthFlows: ['client_credentials'],
    AllowedOAuthFlowsUserPoolClient: true,
  };

  try {
    const command = new CreateUserPoolClientCommand(params);
    const response: CreateUserPoolClientCommandOutput = await client.send(
      command
    );

    const userPoolClient = response.UserPoolClient;

    if (!userPoolClient) throw new Error('client could not be created');

    logger.info('client details: ', JSON.stringify(userPoolClient));

    const createdClient = {
      userPoolId,
      clientName: userPoolClient.ClientName as string,
      clientId: userPoolClient.ClientId as string,
      clientSecret: userPoolClient.ClientSecret,
    };

    return createdClient;
  } catch (error) {
    logger.error('error creating client: ', JSON.stringify(error));
    throw error;
  }
}

export async function updateUserPoolClient(
  userPoolClientId: string,
  scopes: string[]
): Promise<Client> {
  const updateUserPoolClientParams: UpdateUserPoolClientCommandInput = {
    ClientId: userPoolClientId,
    AllowedOAuthFlows: ['client_credentials'],
    AllowedOAuthScopes: scopes,
    UserPoolId: userPoolId,
    SupportedIdentityProviders: ['COGNITO'],
    ExplicitAuthFlows: ['ALLOW_REFRESH_TOKEN_AUTH'],
    AllowedOAuthFlowsUserPoolClient: true,
  };

  const params = new UpdateUserPoolClientCommand(updateUserPoolClientParams);
  const updatedClient: UpdateUserPoolClientCommandOutput = await client.send(
    params
  );

  const response: Client = {
    userPoolId: updatedClient.UserPoolClient?.UserPoolId,
    clientId: updatedClient.UserPoolClient?.ClientId,
    creationDate: updatedClient.UserPoolClient?.CreationDate,
    allowedOAuthScopes: updatedClient.UserPoolClient?.AllowedOAuthScopes,
    clientName: updatedClient.UserPoolClient?.ClientName,
    lastModifiedDate: updatedClient.UserPoolClient?.LastModifiedDate,
  };

  logger.info(`user Pool client updated successfully.`);

  return response;
}

export async function listClients(): Promise<Client[]> {
  const params: ListUserPoolClientsCommandInput = {
    UserPoolId: userPoolId,
  };

  try {
    const command = new ListUserPoolClientsCommand(params);
    const response: ListUserPoolClientsCommandOutput = await client.send(
      command
    );
    logger.info('clients: ', JSON.stringify(response.UserPoolClients));

    if (!response.UserPoolClients) return [];

    return response.UserPoolClients.map((client) => {
      return {
        clientId: client.ClientId,
        clientName: client.ClientName,
        userPoolId: client.UserPoolId,
      };
    });
  } catch (error) {
    logger.error('error listing clients: ', JSON.stringify(error));
    throw error;
  }
}

export async function deleteUserPoolClient(
  userPoolClientId: string
): Promise<void> {
  const deleteUserPoolClientCommandParams: DeleteUserPoolClientCommandInput = {
    ClientId: userPoolClientId,
    UserPoolId: userPoolId,
  };

  const params = new DeleteUserPoolClientCommand(
    deleteUserPoolClientCommandParams
  );
  await client.send(params);

  logger.info(`user Pool client deleted successfully.`);
}

export async function deleteResourceServer(
  resourceServerId: string
): Promise<void> {
  const deleteResourceServerCommandInput: DeleteResourceServerCommandInput = {
    UserPoolId: userPoolId,
    Identifier: resourceServerId,
  };

  const params = new DeleteResourceServerCommand(
    deleteResourceServerCommandInput
  );
  await client.send(params);

  logger.info(`resource server deleted successfully.`);
}

export async function getUserPoolClient(
  userPoolClientId: string
): Promise<Client> {
  const describeUserPoolClientCommandInput: DescribeUserPoolClientCommandInput =
    {
      ClientId: userPoolClientId,
      UserPoolId: userPoolId,
    };

  const params = new DescribeUserPoolClientCommand(
    describeUserPoolClientCommandInput
  );
  const response: DescribeUserPoolClientCommandOutput = await client.send(
    params
  );

  const returnedClient = response.UserPoolClient;

  if (!returnedClient) throw new Error('client not found');

  return {
    userPoolId: userPoolId,
    clientId: userPoolClientId,
    clientName: returnedClient.ClientName,
    creationDate: returnedClient.CreationDate,
    lastModifiedDate: returnedClient.LastModifiedDate,
    allowedOAuthScopes: returnedClient.AllowedOAuthScopes,
  };
}
