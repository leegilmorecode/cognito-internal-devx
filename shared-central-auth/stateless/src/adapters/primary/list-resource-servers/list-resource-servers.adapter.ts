import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger } from '@shared';

import { APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { listResourceServersUseCase } from '@use-cases/list-resource-servers/list-resource-servers';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

export const listResourceServersAdapter =
  async (): Promise<APIGatewayProxyResult> => {
    try {
      const resourceServers = await listResourceServersUseCase();

      metrics.addMetric('SuccessfulListResourceServers', MetricUnits.Count, 1);

      return {
        statusCode: 200,
        body: JSON.stringify(resourceServers),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) errorMessage = error.message;
      logger.error(errorMessage);

      metrics.addMetric('ListResourceServersError', MetricUnits.Count, 1);

      return errorHandler(error);
    }
  };

export const handler = middy(listResourceServersAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
