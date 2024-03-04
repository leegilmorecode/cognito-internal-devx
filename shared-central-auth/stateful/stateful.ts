import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

import { Construct } from 'constructs';

export class SharedCentralAuthStatefulStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the shared cognito user pool for m2m auth i.e client credentials flow
    const authUserPool: cognito.UserPool = new cognito.UserPool(
      this,
      'SharedAuthUserPool',
      {
        userPoolName: 'SharedAuthUserPool',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // create a user pool domain in cognito
    // (this will allow external services to request tokens from it)
    const authUserPoolDomain: cognito.UserPoolDomain =
      new cognito.UserPoolDomain(this, 'SharedAuthUserPoolDomain', {
        userPool: authUserPool,
        cognitoDomain: {
          domainPrefix: 'lj-health-food-auth',
        },
      });

    new cdk.CfnOutput(this, 'SharedAuthUrl', {
      value: `https://${authUserPoolDomain.domainName}.auth.${props?.env?.region}.amazoncognito.com`,
      description: 'The shared auth url',
      exportName: 'SharedAuthUrl',
    });

    new cdk.CfnOutput(this, 'SharedAuthUserPoolId', {
      value: authUserPool.userPoolId,
      description: 'The shared auth user pool id',
      exportName: 'SharedAuthUserPoolId',
    });
  }
}
