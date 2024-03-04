import { createCognitoResourceServer } from '@adapters/secondary/cognito-adapter';
import { ResourceServerScopeType } from '@aws-sdk/client-cognito-identity-provider';
import { CreateResourceServer } from '@dto/create-resource-server';
import { ResourceServer } from '@dto/resource-server';
import { schema } from '@schemas/resource-server';
import { schemaValidator } from '@shared';

export async function createResourceServerUseCase(
  resourceServer: CreateResourceServer
): Promise<ResourceServer> {
  // map the scopes into the correct object array
  const scopes: ResourceServerScopeType[] = resourceServer.scopes.map(
    (scope) => {
      return {
        ScopeName: scope.scopeName,
        ScopeDescription: scope.scopeDescription,
      };
    }
  );

  // create the resource server
  const createdResourceServer = await createCognitoResourceServer(
    resourceServer.name,
    resourceServer.identifier,
    scopes
  );

  // return the new resource server
  const newResourceServer: ResourceServer = {
    identifier: createdResourceServer.Identifier,
    userPoolId: createdResourceServer.UserPoolId,
    name: createdResourceServer.Name,
    scopes: createdResourceServer.Scopes?.map((scope) => {
      return {
        scopeName: scope.ScopeName,
        scopeDescription: scope.ScopeDescription,
      };
    }),
  };

  schemaValidator(schema, newResourceServer);

  return newResourceServer;
}
