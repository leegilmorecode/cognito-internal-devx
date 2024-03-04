import { listClients } from '@adapters/secondary/cognito-adapter';
import { Client } from '@dto/client';

export async function listClientsUseCase(): Promise<Client[]> {
  return await listClients();
}
