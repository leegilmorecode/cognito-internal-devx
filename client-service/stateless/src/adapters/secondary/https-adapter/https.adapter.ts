import { CreateOrder, Order } from '@dto/order';
import { generateAccessToken, logger } from '@shared';

import axios from 'axios';
import { config } from '@config';
import { decode } from 'jsonwebtoken';

export async function createOrder(order: CreateOrder): Promise<Order> {
  // get the configurable details from config
  const clientId = config.get('clientId');
  const clientSecret = config.get('clientSecret');
  const url = config.get('authUrl');
  const resourceServerUrl = config.get('resourceServerUrl');

  // the scope for placing an order with the orders service
  const scopes: string[] = ['lj-health-food/place-order'];

  // generate the access token for the orders service
  // by calling our central auth service with our client creds
  const accessToken = await generateAccessToken(
    clientId,
    clientSecret,
    url,
    scopes
  );

  // Note: we should NEVER log the access token
  // but for this example lets look at the contents of it decoded
  const decoded = decode(accessToken, { complete: true });
  logger.info(`decoded token : ${JSON.stringify(decoded)}`);

  // make a call to the orders api (resource server) to create an order
  // passing our access token in the headers
  const { data }: { data: Order } = await axios.request({
    url: 'orders',
    method: 'post',
    baseURL: resourceServerUrl,
    headers: {
      Authorization: accessToken,
    },
    data: order,
  });

  return data;
}
