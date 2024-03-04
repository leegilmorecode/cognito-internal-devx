import { deleteResourceServer } from '@adapters/secondary/cognito-adapter';

export async function deleteResourceServerUseCase(
  resourceServerId: string
): Promise<void> {
  await deleteResourceServer(resourceServerId);
}
