import { createCognitoUserPoolClient } from '@adapters/secondary/cognito-adapter';
import { CreatedClient } from '@dto/created-client/created-client';
import { schema } from '@schemas/client';
import { schemaValidator } from '@shared';

export async function createClientUseCase(
  clientName: string,
  scopes: string[]
): Promise<CreatedClient> {
  const createdClient: CreatedClient = await createCognitoUserPoolClient(
    clientName,
    scopes
  );

  schemaValidator(schema, createdClient);

  return createdClient;
}
