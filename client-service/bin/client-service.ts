#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { ClientServiceStatefulStack } from '../stateful/stateful';
import { ClientServiceStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const clientServiceStatefulStack = new ClientServiceStatefulStack(
  app,
  'ClientServiceStatefulStack',
  {}
);
new ClientServiceStatelessStack(app, 'ClientServiceStatelessStack', {
  table: clientServiceStatefulStack.table,
});
