import { CreateOrder, Order } from '@dto/order';
import { getISOString, logger, schemaValidator } from '@shared';

import { createOrder } from '@adapters/secondary/database-adapter';
import { schema } from '@schemas/order';
import { v4 as uuid } from 'uuid';

export async function createOrderUseCase(order: CreateOrder): Promise<Order> {
  const createdOrder = {
    ...order,
    id: uuid(),
    created: getISOString(),
  } as Order;

  // ensure the response is in the correct shape
  schemaValidator(schema, createdOrder);

  // save the order into the dynamodb table
  await createOrder(createdOrder);

  logger.info(`order placed: ${JSON.stringify(createdOrder)}`);

  return createdOrder;
}
