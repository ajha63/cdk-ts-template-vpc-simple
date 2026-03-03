import { Environment, Team, VpcConfig, TagConfig } from './types';

export function getVpcConfig(environment: Environment): VpcConfig {
  return {
    vpcCidr: process.env.VPC_CIDR || '10.0.0.0/16',
    environment,
    region: process.env.AWS_REGION || 'us-east-1',
    availabilityZones: [
      `${process.env.AWS_REGION || 'us-east-1'}a`,
      `${process.env.AWS_REGION || 'us-east-1'}b`,
    ],
    team: (process.env.TEAM as Team) || Team.DEVOPS,
    costCenter: process.env.COST_CENTER || 'CC-001',
  };
}

export function getTagConfig(environment: Environment): TagConfig {
  const ambienteMap = {
    [Environment.DEV]: 'DEV',
    [Environment.QA]: 'QA',
    [Environment.PROD]: 'PROD',
  };

  return {
    Ambiente: ambienteMap[environment],
    Equipo: (process.env.TEAM as Team) || Team.DEVOPS,
    CentroDeCostos: process.env.COST_CENTER || 'CC-001',
  };
}
