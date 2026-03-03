import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcConfig, TagConfig } from '../config/types';

export interface SecurityGroupsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  config: VpcConfig;
  resourceTags: TagConfig;
}

export class SecurityGroupsStack extends cdk.Stack {
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly webSecurityGroup: ec2.SecurityGroup;
  public readonly appSecurityGroup: ec2.SecurityGroup;
  public readonly sshSecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupsStackProps) {
    super(scope, id, props);

    const { vpc, config, resourceTags } = props;
    const resourcePrefix = `${config.environment}-sg`;

    // Security Group para ALB (HTTP/HTTPS desde internet)
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet'
    );

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet'
    );

    cdk.Tags.of(this.albSecurityGroup).add('Name', `${resourcePrefix}-alb`);
    cdk.Tags.of(this.albSecurityGroup).add('Ambiente', resourceTags.Ambiente);
    cdk.Tags.of(this.albSecurityGroup).add('Equipo', resourceTags.Equipo);
    cdk.Tags.of(this.albSecurityGroup).add('CentroDeCostos', resourceTags.CentroDeCostos);

    // Security Group para instancias web en subnets públicas
    this.webSecurityGroup = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc,
      description: 'Security group for web servers in public subnets',
      allowAllOutbound: true,
    });

    this.webSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(80),
      'Allow HTTP from ALB'
    );

    this.webSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(443),
      'Allow HTTPS from ALB'
    );

    cdk.Tags.of(this.webSecurityGroup).add('Name', `${resourcePrefix}-web`);
    cdk.Tags.of(this.webSecurityGroup).add('Ambiente', resourceTags.Ambiente);
    cdk.Tags.of(this.webSecurityGroup).add('Equipo', resourceTags.Equipo);
    cdk.Tags.of(this.webSecurityGroup).add('CentroDeCostos', resourceTags.CentroDeCostos);

    // Security Group para aplicaciones en subnets privadas
    this.appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc,
      description: 'Security group for application servers in private subnets',
      allowAllOutbound: true,
    });

    this.appSecurityGroup.addIngressRule(
      this.webSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow traffic from web tier'
    );

    this.appSecurityGroup.addIngressRule(
      this.appSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow traffic between app servers'
    );

    cdk.Tags.of(this.appSecurityGroup).add('Name', `${resourcePrefix}-app`);
    cdk.Tags.of(this.appSecurityGroup).add('Ambiente', resourceTags.Ambiente);
    cdk.Tags.of(this.appSecurityGroup).add('Equipo', resourceTags.Equipo);
    cdk.Tags.of(this.appSecurityGroup).add('CentroDeCostos', resourceTags.CentroDeCostos);

    // Security Group para SSH en instancias privadas
    this.sshSecurityGroup = new ec2.SecurityGroup(this, 'SshSecurityGroup', {
      vpc,
      description: 'Security group for SSH access to private instances',
      allowAllOutbound: false,
    });

    // Permitir SSH desde la VPC (bastion host o VPN)
    this.sshSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(22),
      'Allow SSH from VPC'
    );

    cdk.Tags.of(this.sshSecurityGroup).add('Name', `${resourcePrefix}-ssh`);
    cdk.Tags.of(this.sshSecurityGroup).add('Ambiente', resourceTags.Ambiente);
    cdk.Tags.of(this.sshSecurityGroup).add('Equipo', resourceTags.Equipo);
    cdk.Tags.of(this.sshSecurityGroup).add('CentroDeCostos', resourceTags.CentroDeCostos);

    // Security Group para RDS
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc,
      description: 'Security group for RDS databases',
      allowAllOutbound: false,
    });

    this.rdsSecurityGroup.addIngressRule(
      this.appSecurityGroup,
      ec2.Port.tcp(3306),
      'Allow MySQL from app tier'
    );

    this.rdsSecurityGroup.addIngressRule(
      this.appSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from app tier'
    );

    cdk.Tags.of(this.rdsSecurityGroup).add('Name', `${resourcePrefix}-rds`);
    cdk.Tags.of(this.rdsSecurityGroup).add('Ambiente', resourceTags.Ambiente);
    cdk.Tags.of(this.rdsSecurityGroup).add('Equipo', resourceTags.Equipo);
    cdk.Tags.of(this.rdsSecurityGroup).add('CentroDeCostos', resourceTags.CentroDeCostos);

    // Outputs
    new cdk.CfnOutput(this, 'AlbSecurityGroupId', {
      value: this.albSecurityGroup.securityGroupId,
      description: 'ALB Security Group ID',
      exportName: `${resourcePrefix}-alb-id`,
    });

    new cdk.CfnOutput(this, 'WebSecurityGroupId', {
      value: this.webSecurityGroup.securityGroupId,
      description: 'Web Security Group ID',
      exportName: `${resourcePrefix}-web-id`,
    });

    new cdk.CfnOutput(this, 'AppSecurityGroupId', {
      value: this.appSecurityGroup.securityGroupId,
      description: 'App Security Group ID',
      exportName: `${resourcePrefix}-app-id`,
    });

    new cdk.CfnOutput(this, 'SshSecurityGroupId', {
      value: this.sshSecurityGroup.securityGroupId,
      description: 'SSH Security Group ID',
      exportName: `${resourcePrefix}-ssh-id`,
    });

    new cdk.CfnOutput(this, 'RdsSecurityGroupId', {
      value: this.rdsSecurityGroup.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: `${resourcePrefix}-rds-id`,
    });
  }
}
