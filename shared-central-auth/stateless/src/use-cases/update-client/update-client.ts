import { updateUserPoolClient } from '@adapters/secondary/cognito-adapter';
import { Client } from '@dto/client';
import { schema } from '@schemas/client';
import { schemaValidator } from '@shared';

export async function updateClientUseCase(
  userPoolClientId: string,
  scopes: string[]
): Promise<Client> {
  const updatedClient: Client = await updateUserPoolClient(
    userPoolClientId,
    scopes
  );

  schemaValidator(schema, updatedClient);

  return updatedClient;
}
