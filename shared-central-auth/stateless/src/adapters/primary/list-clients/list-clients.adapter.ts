import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger } from '@shared';

import { APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { listClientsUseCase } from '@use-cases/list-clients/list-clients';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

export const listClientsAdapter = async (): Promise<APIGatewayProxyResult> => {
  try {
    const clients = await listClientsUseCase();

    metrics.addMetric('SuccessfulListClients', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(clients),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('ListClientsError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(listClientsAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
