import { Client } from '@dto/client';
import { getUserPoolClient } from '@adapters/secondary/cognito-adapter';

export async function getClientUserCase(
  userPoolClientId: string
): Promise<Client> {
  return await getUserPoolClient(userPoolClientId);
}
