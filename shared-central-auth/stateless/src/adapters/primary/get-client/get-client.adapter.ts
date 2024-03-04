import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger } from '@shared';

import { getClientUserCase } from '@use-cases/get-client/get-client';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

export const getClientAdapter = async ({
  pathParameters,
}: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!pathParameters || !pathParameters.id)
      throw new Error('no id suuplied');

    const { id } = pathParameters;
    const clients = await getClientUserCase(id);

    metrics.addMetric('SuccessfulGetClient', MetricUnits.Count, 1);

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

    metrics.addMetric('GetClientError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(getClientAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
