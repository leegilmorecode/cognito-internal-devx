import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

interface ClientServiceStatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class ClientServiceStatelessStack extends cdk.Stack {
  private table: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: ClientServiceStatelessStackProps
  ) {
    super(scope, id, props);

    this.table = props.table;

    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: '3rdPartyClientService',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: '3rdPartyClient',
    };

    // create the lambda function for placing a new order via our 3rd party service
    const createOrder: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateClientOrder', {
        functionName: 'client-create-order',
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
          AUTH_URL:
            'https://lj-health-food-auth.auth.eu-west-1.amazoncognito.com',
          // note: the following client creds should come from parameter store
          // and not as environment vars. This is for the demo only.
          CLIENT_ID: 'your-client-id',
          CLIENT_SECRET: 'your-client-secret',
          // the api we want to call to place the order once we get an access token
          RESOURCE_SERVER_URL:
            'https://your-orders-service-rest-id.execute-api.eu-west-1.amazonaws.com/prod/',
          TABLE_NAME: this.table.tableName,
        },
      });

    // allow the lambda function to write to the table for new orders
    this.table.grantWriteData(createOrder);

    // create our experience layer api for the 3rd party client app
    const api: apigw.RestApi = new apigw.RestApi(this, 'Api', {
      description: 'LJ Health Food - 3rd Party Client API',
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create our resources on the api for 'orders'
    const orders: apigw.Resource = api.root.addResource('orders');

    // ensure that our lambda function is invoked through the api
    orders.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrder, {
        proxy: true,
      })
    );
  }
}
