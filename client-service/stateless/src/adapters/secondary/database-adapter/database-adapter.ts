import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';
import { config } from '@config';
import { Order } from '@dto/order';
import { logger } from '@shared';

const dynamoDb = new DynamoDBClient({});

export async function saveOrder(newOrder: Order): Promise<Order> {
  const tableName = config.get('tableName');

  const params = {
    TableName: tableName,
    Item: marshall(newOrder),
  };

  try {
    await dynamoDb.send(new PutItemCommand(params));

    logger.info(`order created with ${newOrder.id} into ${tableName}`);

    return newOrder;
  } catch (error) {
    console.error('error creating order:', error);
    throw error;
  }
}
