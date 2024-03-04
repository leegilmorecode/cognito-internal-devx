import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { Client } from '@dto/client';
import { UpdateClient } from '@dto/update-client';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { updateClientUseCase } from '@use-cases/update-client';
import { schema } from './update-client.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const updateClientAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const updatedClient = JSON.parse(body) as UpdateClient;

    schemaValidator(schema, updatedClient);

    const updated: Client = await updateClientUseCase(
      updatedClient.clientId,
      updatedClient.scopes
    );

    metrics.addMetric('SuccessfulUpdateClient', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(updated),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('UpdateClientError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(updateClientAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
