import { deleteUserPoolClient } from '@adapters/secondary/cognito-adapter';

export async function deleteClientUseCase(
  userPoolClientId: string
): Promise<void> {
  await deleteUserPoolClient(userPoolClientId);
}
