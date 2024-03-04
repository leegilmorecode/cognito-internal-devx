#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { SharedCentralAuthStatefulStack } from '../stateful/stateful';
import { SharedCentralAuthStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
new SharedCentralAuthStatelessStack(app, 'SharedCentralAuthStatelessStack', {});
new SharedCentralAuthStatefulStack(app, 'SharedCentralAuthStatefulStack', {});
