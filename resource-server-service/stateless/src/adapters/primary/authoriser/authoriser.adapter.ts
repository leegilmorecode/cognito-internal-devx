import 'source-map-support/register';

import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { PolicyDocument } from 'aws-lambda';
import { config } from '@config';
import { logger } from '@shared';

const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: config.get('userPoolId'),
  clientId: [config.get('clientId')], // array of valid client ids
  scope: [config.get('scopes')], // allowed scopes
  tokenUse: 'access',
});

export const handler = async function (
  event: any
): Promise<APIGatewayAuthorizerResult> {
  try {
    // grab the auth token from the request which the client has got through
    // using their clientId and client secret (with scopes) and attaching the token
    // to the request in the auth header.
    const authToken = event.headers['Authorization'] || '';

    // lets put this in the logs for the demo only
    logger.info(`Auth token: ${authToken}`);

    // verify the token
    const decodedJWT = await cognitoJwtVerifier.verify(authToken);

    // create an allow policy for the methodArn
    const policyDocument: PolicyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event['methodArn'],
        },
      ],
    };

    // pass the clientId through on the context
    const context = {
      clientId: decodedJWT.sub,
    };

    const response: APIGatewayAuthorizerResult = {
      principalId: decodedJWT.sub,
      policyDocument,
      context,
    };

    return response;
  } catch (err) {
    console.error('invalid auth token: ', err);
    throw new Error('unauthorized');
  }
};
