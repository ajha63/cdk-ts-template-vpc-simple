export enum Environment {
  DEV = 'dev',
  QA = 'qa',
  PROD = 'prod'
}

export enum Team {
  DEVOPS = 'DevOps',
  DEVSECOPS = 'DevSecOps',
  COMPLAINT = 'Complaint'
}

export interface VpcConfig {
  vpcCidr: string;
  environment: Environment;
  region: string;
  availabilityZones: string[];
  team: Team;
  costCenter: string;
}

export interface TagConfig {
  Ambiente: string;
  Equipo: Team;
  CentroDeCostos: string;
}
