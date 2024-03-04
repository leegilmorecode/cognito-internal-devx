import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

export class SharedCentralAuthStatelessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // import the stack values
    const userPoolId = cdk.Fn.importValue('SharedAuthUserPoolId');

    // get an instance of the user pool
    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      'UserPool',
      userPoolId
    );

    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'CentralAuthService',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'LJHealthFood',
    };

    // create the lambda function for adding a new resource server
    const createResourceServer: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateResourceServer', {
        functionName: 'create-resource-server',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/create-resource-server/create-resource-server.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // create the lambda function for adding a new client
    const createClient: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateClient', {
        functionName: 'create-client',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/create-client/create-client.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // update the client to add the new scopes and association to the resource server
    const updateClient: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'UpdateClient', {
        functionName: 'update-client',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/update-client/update-client.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // list all resource servers
    const listResourceServers: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'ListResourceServers', {
        functionName: 'list-resource-servers',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/list-resource-servers/list-resource-servers.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // list all clients
    const listClients: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'ListClients', {
        functionName: 'list-clients',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/list-clients/list-clients.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // delete client
    const deleteClient: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'DeleteClient', {
        functionName: 'delete-client',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/delete-client/delete-client.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // delete resource server
    const deleteResourceServer: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'DeleteResourceServer', {
        functionName: 'delete-resource-server',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/delete-resource-server/delete-resource-server.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      });

    // get an existing client by id
    const getClient: nodeLambda.NodejsFunction = new nodeLambda.NodejsFunction(
      this,
      'GetClient',
      {
        functionName: 'get-client',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/get-client/get-client.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          USER_POOL_ID: userPoolId,
        },
      }
    );

    // give the lambda functions access to the user pool
    createResourceServer.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:CreateResourceServer'],
        resources: [userPool.userPoolArn],
      })
    );

    createClient.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:CreateUserPoolClient'],
        resources: [userPool.userPoolArn],
      })
    );

    updateClient.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:UpdateUserPoolClient'],
        resources: [userPool.userPoolArn],
      })
    );

    listResourceServers.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:ListResourceServers'],
        resources: [userPool.userPoolArn],
      })
    );

    listClients.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:ListUserPoolClients'],
        resources: [userPool.userPoolArn],
      })
    );

    deleteClient.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:DeleteUserPoolClient'],
        resources: [userPool.userPoolArn],
      })
    );

    deleteResourceServer.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:DeleteResourceServer'],
        resources: [userPool.userPoolArn],
      })
    );

    getClient.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:DescribeUserPoolClient'],
        resources: [userPool.userPoolArn],
      })
    );

    // create our experience layer api
    const api: apigw.RestApi = new apigw.RestApi(this, 'CentralAuthApi', {
      description: 'LJ Food Delivery - Central Auth Service',
      deploy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create our resources on the api
    const resourceServers: apigw.Resource =
      api.root.addResource('resource-servers');
    const clients: apigw.Resource = api.root.addResource('clients');
    const client: apigw.Resource = clients.addResource('{id}');
    const resourceServer: apigw.Resource = resourceServers.addResource('{id}');

    resourceServers.addMethod(
      'POST',
      new apigw.LambdaIntegration(createResourceServer, {
        proxy: true,
      })
    );

    resourceServers.addMethod(
      'GET',
      new apigw.LambdaIntegration(listResourceServers, {
        proxy: true,
      })
    );

    clients.addMethod(
      'POST',
      new apigw.LambdaIntegration(createClient, {
        proxy: true,
      })
    );

    clients.addMethod(
      'GET',
      new apigw.LambdaIntegration(listClients, {
        proxy: true,
      })
    );

    clients.addMethod(
      'PATCH',
      new apigw.LambdaIntegration(updateClient, {
        proxy: true,
      })
    );

    client.addMethod(
      'DELETE',
      new apigw.LambdaIntegration(deleteClient, {
        proxy: true,
      })
    );

    client.addMethod(
      'GET',
      new apigw.LambdaIntegration(getClient, {
        proxy: true,
      })
    );

    resourceServer.addMethod(
      'DELETE',
      new apigw.LambdaIntegration(deleteResourceServer, {
        proxy: true,
      })
    );
  }
}
