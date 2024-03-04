import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { CreateClient } from '@dto/create-client';
import { CreatedClient } from '@dto/created-client/created-client';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { createClientUseCase } from '@use-cases/create-client/create-client';
import { schema } from './create-client.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const createClientAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const client = JSON.parse(body) as CreateClient;

    schemaValidator(schema, client);

    const created: CreatedClient = await createClientUseCase(
      client.clientName,
      client.scopes
    );

    metrics.addMetric('SuccessfulCreateClient', MetricUnits.Count, 1);

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

    metrics.addMetric('CreateClientError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createClientAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
