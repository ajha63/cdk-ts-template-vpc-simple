#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkingStack } from '../lib/stacks/networking-stack';
import { SecurityGroupsStack } from '../lib/stacks/security-groups-stack';
import { Environment } from '../lib/config/types';
import { getVpcConfig, getTagConfig } from '../lib/config/config';

const app = new cdk.App();

// Obtener el ambiente desde el contexto o variable de entorno
const environmentStr = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const environment = environmentStr as Environment;

// Validar ambiente
if (!Object.values(Environment).includes(environment)) {
  throw new Error(`Invalid environment: ${environmentStr}. Must be one of: ${Object.values(Environment).join(', ')}`);
}

// Obtener configuración
const config = getVpcConfig(environment);
const tags = getTagConfig(environment);

// Stack de Networking
const networkingStack = new NetworkingStack(app, `${environment}-networking-stack`, {
  config,
  resourceTags: tags,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
  description: `Networking stack for ${environment} environment - VPC, Subnets, NAT Instances`,
});

// Stack de Security Groups
const securityGroupsStack = new SecurityGroupsStack(app, `${environment}-security-groups-stack`, {
  vpc: networkingStack.vpc,
  config,
  resourceTags: tags,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
  description: `Security Groups stack for ${environment} environment`,
});

// Dependencia: Security Groups depende de Networking
securityGroupsStack.addDependency(networkingStack);

// Tags globales
cdk.Tags.of(app).add('ManagedBy', 'CDK');
cdk.Tags.of(app).add('Project', 'VPC-Infrastructure');

app.synth();
