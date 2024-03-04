import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

export interface ResourceServerServiceStatelessStackProps
  extends cdk.StackProps {
  table: dynamodb.Table;
}

export class ResourceServerServiceStatelessStack extends cdk.Stack {
  private table: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: ResourceServerServiceStatelessStackProps
  ) {
    super(scope, id, props);
    this.table = props.table;

    // imported the values from the other stack
    const userPoolId = cdk.Fn.importValue('SharedAuthUserPoolId');

    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'resource-server-service',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'LJHealthFoodOrdersService',
    };

    // create the lambda authoriser function
    const authLambda: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(
      this,
      'AuthLambda',
      {
        functionName: 'resource-server-auth-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/authoriser/authoriser.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USERPOOL_ID: userPoolId,
        },
      }
    );

    // create a request based lambda authoriser to validate access tokens
    const authoriser = new apigw.RequestAuthorizer(
      this,
      'api-request-authoriser',
      {
        handler: authLambda,
        identitySources: [apigw.IdentitySource.header('Authorization')],
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // create the lambda function for creating a new order
    const createOrder: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateOrder', {
        functionName: 'resource-server-create-order',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/create-order/create-order.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    // allow the lambda function to write to the table for new orders
    this.table.grantWriteData(createOrder);

    // create our resource server api so third parties can place orders with us
    const api: apigw.RestApi = new apigw.RestApi(this, 'Api', {
      description: 'LJ Health Food - Resource Server API',
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create our resources on the api for 'orders'
    const orders: apigw.Resource = api.root.addResource('orders');

    // ensure that our lambda function is invoked through the api
    // and we have a request based lambda authoriser to validate the token
    orders.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrder, {
        proxy: true,
      }),
      {
        authorizer: authoriser, // add our lambda authoriser
        authorizationType: apigw.AuthorizationType.CUSTOM,
      }
    );
  }
}
