import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { deleteResourceServerUseCase } from '@use-cases/delete-resource-server/delete-resource-server';

const tracer = new Tracer();
const metrics = new Metrics();

export const deleteResourceServerAdapter = async ({
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!pathParameters || !pathParameters?.id)
      throw new ValidationError('no id supplied');

    const { id } = pathParameters;

    await deleteResourceServerUseCase(id);

    metrics.addMetric('SuccessfulDeleteResourceServer', MetricUnits.Count, 1);

    return {
      statusCode: 204,
      body: 'No content',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('DeleteResourceServerError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(deleteResourceServerAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
