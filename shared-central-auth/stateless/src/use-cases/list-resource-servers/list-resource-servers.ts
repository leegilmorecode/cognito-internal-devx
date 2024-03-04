import { listResourceServers } from '@adapters/secondary/cognito-adapter';
import { ResourceServer } from '@dto/resource-server';

export async function listResourceServersUseCase(): Promise<ResourceServer[]> {
  return await listResourceServers();
}
