import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { VpcConfig, TagConfig } from '../config/types';

export interface NetworkingStackProps extends cdk.StackProps {
  config: VpcConfig;
  tags: TagConfig;
}

export class NetworkingStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly privateAppSubnets: ec2.ISubnet[];
  public readonly privateDbSubnets: ec2.ISubnet[];
  public readonly natInstances: ec2.Instance[];

  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);

    const { config, tags } = props;
    const resourcePrefix = `${config.environment}-vpc`;

    // Crear VPC sin subnets automáticas
    this.vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: `${resourcePrefix}-main`,
      ipAddresses: ec2.IpAddresses.cidr(config.vpcCidr),
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Aplicar tags a la VPC
    cdk.Tags.of(this.vpc).add('Name', `${resourcePrefix}-main`);
    cdk.Tags.of(this.vpc).add('Ambiente', tags.Ambiente);
    cdk.Tags.of(this.vpc).add('Equipo', tags.Equipo);
    cdk.Tags.of(this.vpc).add('CentroDeCostos', tags.CentroDeCostos);

    // Internet Gateway
    const igw = new ec2.CfnInternetGateway(this, 'InternetGateway', {
      tags: [
        { key: 'Name', value: `${resourcePrefix}-igw` },
        { key: 'Ambiente', value: tags.Ambiente },
        { key: 'Equipo', value: tags.Equipo },
        { key: 'CentroDeCostos', value: tags.CentroDeCostos },
      ],
    });

    new ec2.CfnVPCGatewayAttachment(this, 'VPCGatewayAttachment', {
      vpcId: this.vpc.vpcId,
      internetGatewayId: igw.ref,
    });

    // Calcular subnets CIDR
    const baseIp = config.vpcCidr.split('/')[0];
    const baseOctets = baseIp.split('.').map(Number);
    
    this.publicSubnets = [];
    this.privateAppSubnets = [];
    this.privateDbSubnets = [];
    this.natInstances = [];

    // Crear subnets para cada AZ
    config.availabilityZones.forEach((az, azIndex) => {
      const azSuffix = azIndex + 1;
      
      // 2 Subnets públicas por AZ
      for (let i = 0; i < 2; i++) {
        const subnetIndex = azIndex * 8 + i;
        const cidr = `${baseOctets[0]}.${baseOctets[1]}.${subnetIndex}.0/24`;
        
        const publicSubnet = new ec2.PublicSubnet(this, `PublicSubnet${azSuffix}-${i + 1}`, {
          vpcId: this.vpc.vpcId,
          cidrBlock: cidr,
          availabilityZone: az,
          mapPublicIpOnLaunch: true,
        });

        cdk.Tags.of(publicSubnet).add('Name', `${resourcePrefix}-public-${azSuffix}-${i + 1}`);
        cdk.Tags.of(publicSubnet).add('Ambiente', tags.Ambiente);
        cdk.Tags.of(publicSubnet).add('Equipo', tags.Equipo);
        cdk.Tags.of(publicSubnet).add('CentroDeCostos', tags.CentroDeCostos);

        this.publicSubnets.push(publicSubnet);
      }

      // 1 Subnet privada para aplicaciones
      const appSubnetIndex = azIndex * 8 + 2;
      const appCidr = `${baseOctets[0]}.${baseOctets[1]}.${appSubnetIndex}.0/24`;
      
      const privateAppSubnet = new ec2.PrivateSubnet(this, `PrivateAppSubnet${azSuffix}`, {
        vpcId: this.vpc.vpcId,
        cidrBlock: appCidr,
        availabilityZone: az,
      });

      cdk.Tags.of(privateAppSubnet).add('Name', `${resourcePrefix}-private-app-${azSuffix}`);
      cdk.Tags.of(privateAppSubnet).add('Ambiente', tags.Ambiente);
      cdk.Tags.of(privateAppSubnet).add('Equipo', tags.Equipo);
      cdk.Tags.of(privateAppSubnet).add('CentroDeCostos', tags.CentroDeCostos);

      this.privateAppSubnets.push(privateAppSubnet);

      // 1 Subnet privada aislada para RDS
      const dbSubnetIndex = azIndex * 8 + 3;
      const dbCidr = `${baseOctets[0]}.${baseOctets[1]}.${dbSubnetIndex}.0/24`;
      
      const privateDbSubnet = new ec2.PrivateSubnet(this, `PrivateDbSubnet${azSuffix}`, {
        vpcId: this.vpc.vpcId,
        cidrBlock: dbCidr,
        availabilityZone: az,
      });

      cdk.Tags.of(privateDbSubnet).add('Name', `${resourcePrefix}-private-db-${azSuffix}`);
      cdk.Tags.of(privateDbSubnet).add('Ambiente', tags.Ambiente);
      cdk.Tags.of(privateDbSubnet).add('Equipo', tags.Equipo);
      cdk.Tags.of(privateDbSubnet).add('CentroDeCostos', tags.CentroDeCostos);

      this.privateDbSubnets.push(privateDbSubnet);
    });

    // Configurar route tables para subnets públicas
    this.publicSubnets.forEach((subnet) => {
      const publicSubnet = subnet as ec2.PublicSubnet;
      publicSubnet.addRoute('DefaultRoute', {
        routerType: ec2.RouterType.GATEWAY,
        routerId: igw.ref,
        destinationCidrBlock: '0.0.0.0/0',
      });
    });

    // Crear NAT Instances (apagadas por defecto)
    this.createNatInstances(config, tags, resourcePrefix);

    // Outputs
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${resourcePrefix}-id`,
    });

    new cdk.CfnOutput(this, 'VpcCidr', {
      value: this.vpc.vpcCidrBlock,
      description: 'VPC CIDR Block',
    });
  }

  private createNatInstances(config: VpcConfig, tags: TagConfig, resourcePrefix: string): void {
    // AMI de Amazon Linux 2 optimizada para NAT
    const natAmi = ec2.MachineImage.latestAmazonLinux2({
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Role para NAT Instance
    const natRole = new iam.Role(this, 'NatInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // Security Group para NAT Instance
    const natSecurityGroup = new ec2.SecurityGroup(this, 'NatInstanceSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for NAT instances',
      allowAllOutbound: true,
    });

    // Permitir tráfico desde subnets privadas
    natSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.allTraffic(),
      'Allow traffic from VPC'
    );

    cdk.Tags.of(natSecurityGroup).add('Name', `${resourcePrefix}-nat-sg`);
    cdk.Tags.of(natSecurityGroup).add('Ambiente', tags.Ambiente);
    cdk.Tags.of(natSecurityGroup).add('Equipo', tags.Equipo);
    cdk.Tags.of(natSecurityGroup).add('CentroDeCostos', tags.CentroDeCostos);

    // Crear una NAT Instance por AZ en la primera subnet pública
    config.availabilityZones.forEach((az, index) => {
      const natInstance = new ec2.Instance(this, `NatInstance${index + 1}`, {
        vpc: this.vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        machineImage: natAmi,
        securityGroup: natSecurityGroup,
        role: natRole,
        vpcSubnets: {
          subnets: [this.publicSubnets[index * 2]], // Primera subnet pública de cada AZ
        },
        sourceDestCheck: false,
        userData: ec2.UserData.custom(`#!/bin/bash
echo 1 > /proc/sys/net/ipv4/ip_forward
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
yum install -y iptables-services
service iptables save
`),
      });

      cdk.Tags.of(natInstance).add('Name', `${resourcePrefix}-nat-${index + 1}`);
      cdk.Tags.of(natInstance).add('Ambiente', tags.Ambiente);
      cdk.Tags.of(natInstance).add('Equipo', tags.Equipo);
      cdk.Tags.of(natInstance).add('CentroDeCostos', tags.CentroDeCostos);

      // Detener la instancia por defecto usando CloudFormation
      const cfnInstance = natInstance.node.defaultChild as ec2.CfnInstance;
      cfnInstance.addPropertyOverride('InstanceInitiatedShutdownBehavior', 'stop');

      this.natInstances.push(natInstance);

      new cdk.CfnOutput(this, `NatInstance${index + 1}Id`, {
        value: natInstance.instanceId,
        description: `NAT Instance ${index + 1} ID (stopped by default)`,
      });
    });
  }
}
