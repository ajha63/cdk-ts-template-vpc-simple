# Stacks

Este directorio contiene los diferentes stacks de infraestructura.

## Stacks Implementados

### NetworkingStack
- VPC con CIDR configurable
- 8 subnets distribuidas en 2 AZs
- Internet Gateway
- NAT Instances (apagadas por defecto)
- Route tables configuradas

### SecurityGroupsStack
- Security groups para ALB, Web, App, SSH y RDS
- Reglas de ingreso/egreso configuradas
- Dependencias entre security groups

## Agregar Nuevos Stacks

### Ejemplo: EC2 Stack

Crear `lib/stacks/ec2-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcConfig, TagConfig } from '../config/types';

export interface Ec2StackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
  config: VpcConfig;
  tags: TagConfig;
}

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const { vpc, securityGroup, config, tags } = props;
    const resourcePrefix = \`\${config.environment}-ec2\`;

    // Tu código aquí
  }
}
```

Luego agregar en `bin/app.ts`:

```typescript
import { Ec2Stack } from '../lib/stacks/ec2-stack';

const ec2Stack = new Ec2Stack(app, \`\${environment}-ec2-stack\`, {
  vpc: networkingStack.vpc,
  securityGroup: securityGroupsStack.appSecurityGroup,
  config,
  tags,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
});

ec2Stack.addDependency(securityGroupsStack);
```

### Ejemplo: RDS Stack

Similar al ejemplo anterior, crear `lib/stacks/rds-stack.ts` y agregarlo en `bin/app.ts`.

## Convenciones

1. Cada stack debe recibir `config` y `tags`
2. Usar `resourcePrefix` para nombres consistentes
3. Aplicar tags a todos los recursos
4. Definir dependencias explícitas con `addDependency()`
5. Exportar recursos importantes como propiedades públicas
6. Crear outputs para valores que otros stacks puedan necesitar
