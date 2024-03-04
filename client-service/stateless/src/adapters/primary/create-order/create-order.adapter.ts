import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { CreateOrder, Order } from '@dto/order';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { createOrderUseCase } from '@use-cases/create-order';
import { schema } from './create-order.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const createOrderAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const order = JSON.parse(body) as CreateOrder;

    schemaValidator(schema, order);

    const created: Order = await createOrderUseCase(order);

    metrics.addMetric('SuccessfulCreateOrder', MetricUnits.Count, 1);

    return {
      statusCode: 201,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateOrderError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createOrderAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
