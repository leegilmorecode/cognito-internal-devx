import { CreateOrder, Order } from '@dto/order';
import { logger, schemaValidator } from '@shared';

import { createOrder } from '@adapters/secondary/https-adapter';
import { saveOrder } from '@adapters/secondary/database-adapter';
import { schema } from '@schemas/order';

export async function createOrderUseCase(order: CreateOrder): Promise<Order> {
  logger.info(`order being placed: ${JSON.stringify(order)}`);

  // create the order by calling our other service via https with an auth token
  const createdOrder = await createOrder(order);

  // ensure the order created response on the api is the correct shape
  schemaValidator(schema, createdOrder);

  // persist the order returned from the order service into dynamodb
  await saveOrder(createdOrder);

  logger.info(`order placed with id: ${JSON.stringify(createdOrder.id)}`);

  return createdOrder;
}
