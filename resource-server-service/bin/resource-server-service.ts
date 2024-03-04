#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { ResourceServerServiceStatefulStack } from '../stateful/stateful';
import { ResourceServerServiceStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const resourceServerServiceStatefulStack =
  new ResourceServerServiceStatefulStack(
    app,
    'ResourceServerServiceStatefulStack',
    {}
  );
new ResourceServerServiceStatelessStack(
  app,
  'ResourceServerServiceStatelessStack',
  {
    table: resourceServerServiceStatefulStack.table,
  }
);
