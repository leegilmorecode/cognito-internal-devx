import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { CreateResourceServer } from '@dto/create-resource-server';
import { ResourceServer } from '@dto/resource-server';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { createResourceServerUseCase } from '@use-cases/create-resource-server';
import { schema } from './create-resource-server.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const createResourceServerAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const resourceServer = JSON.parse(body) as CreateResourceServer;

    schemaValidator(schema, resourceServer);

    const created: ResourceServer = await createResourceServerUseCase(
      resourceServer
    );

    metrics.addMetric('SuccessfulCreateResourceServer', MetricUnits.Count, 1);

    return {
      statusCode: 201,
      body: JSON.stringify(created),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateResourceServerError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createResourceServerAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
