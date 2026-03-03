# AWS VPC CDK Template

Plantilla de AWS CDK en TypeScript para el despliegue de una VPC con arquitectura multi-capa en dos zonas de disponibilidad.

## Arquitectura

### Componentes de Red
- **VPC**: Red virtual privada con CIDR configurable
- **2 Zonas de Disponibilidad** (us-east-1a, us-east-1b)
- **8 Subnets totales** (/24 cada una):
  - 4 Subnets públicas (2 por AZ)
  - 2 Subnets privadas para aplicaciones (1 por AZ)
  - 2 Subnets privadas aisladas para RDS (1 por AZ)
- **NAT Instances**: Instancias EC2 t2.micro configuradas como NAT (apagadas por defecto)
- **Internet Gateway**: Para conectividad de subnets públicas

### Security Groups
- **ALB Security Group**: HTTP/HTTPS desde internet
- **Web Security Group**: Tráfico desde ALB
- **App Security Group**: Tráfico desde web tier y entre aplicaciones
- **SSH Security Group**: SSH desde dentro de la VPC
- **RDS Security Group**: MySQL/PostgreSQL desde app tier

## Requisitos Previos

- Node.js >= 18.x
- AWS CLI configurado
- AWS CDK CLI: `npm install -g aws-cdk`
- Credenciales de AWS configuradas

## Instalación

```bash
npm install
```

## Configuración

### Variables de Entorno

Crear un archivo `.env` o exportar las siguientes variables:

```bash
# Obligatorias
export AWS_REGION=us-east-1
export ENVIRONMENT=dev  # dev, qa, prod

# Opcionales (con valores por defecto)
export VPC_CIDR=10.0.0.0/16
export TEAM=DevOps  # DevOps, DevSecOps, Complaint
export COST_CENTER=CC-001
```

### Configuración por Ambiente

El proyecto soporta tres ambientes: `dev`, `qa`, `prod`

## Uso

### Sintetizar CloudFormation

```bash
npm run synth
```

### Desplegar

```bash
# Desplegar todos los stacks
npm run deploy

# Desplegar un ambiente específico
cdk deploy --all --context environment=dev

# Desplegar con CIDR personalizado
VPC_CIDR=172.16.0.0/16 cdk deploy --all --context environment=prod
```

### Ver Diferencias

```bash
npm run diff
```

### Destruir Infraestructura

```bash
npm run destroy
```

## Estructura del Proyecto

```
.
├── bin/
│   └── app.ts                    # Punto de entrada de la aplicación CDK
├── lib/
│   ├── config/
│   │   ├── types.ts              # Tipos y enums
│   │   └── config.ts             # Configuración por ambiente
│   └── stacks/
│       ├── networking-stack.ts   # VPC, subnets, NAT instances
│       └── security-groups-stack.ts  # Security groups
├── cdk.json                      # Configuración de CDK
├── package.json
├── tsconfig.json
└── README.md
```

## Convención de Nombres

Los recursos siguen el patrón: `{ambiente}-{servicio}-{id}`

Ejemplos:
- `dev-vpc-main`
- `prod-sg-alb`
- `qa-vpc-nat-1`

## Tags

Todos los recursos incluyen los siguientes tags:
- **Ambiente**: DEV, QA, PROD
- **Equipo**: DevOps, DevSecOps, Complaint
- **CentroDeCostos**: Código del centro de costos
- **ManagedBy**: CDK
- **Project**: VPC-Infrastructure

## NAT Instances

Las NAT Instances se crean apagadas por defecto para evitar costos. Para activarlas:

1. Ir a la consola de EC2
2. Seleccionar la instancia NAT
3. Iniciar la instancia

Las instancias están configuradas con:
- Tipo: t2.micro
- AMI: Amazon Linux 2
- IP forwarding habilitado
- iptables configurado para NAT
- Source/Dest check deshabilitado

## Outputs

Cada stack exporta valores útiles:
- VPC ID
- Security Group IDs
- NAT Instance IDs
- Subnet IDs (disponibles en el código)

## Próximos Pasos

Para agregar más stacks (EC2, RDS, etc.), crear nuevos archivos en `lib/stacks/` y agregarlos en `bin/app.ts`.

Ejemplo para EC2:
```typescript
const ec2Stack = new Ec2Stack(app, `${environment}-ec2-stack`, {
  vpc: networkingStack.vpc,
  securityGroup: securityGroupsStack.appSecurityGroup,
  config,
  tags,
});
```

## Comandos Útiles

- `npm run build` - Compilar TypeScript
- `npm run watch` - Compilar en modo watch
- `cdk ls` - Listar todos los stacks
- `cdk synth` - Sintetizar CloudFormation
- `cdk deploy` - Desplegar stacks
- `cdk diff` - Ver cambios
- `cdk destroy` - Eliminar stacks

## Notas Importantes

1. Las NAT Instances están apagadas por defecto para evitar costos
2. Las subnets privadas no tienen salida a internet por defecto
3. Para habilitar salida a internet en subnets privadas, iniciar las NAT Instances
4. El CIDR de la VPC debe ser /16 o mayor para acomodar 8 subnets /24
5. Los Security Groups siguen el principio de menor privilegio

## Soporte

Para problemas o preguntas, revisar la documentación de AWS CDK:
- https://docs.aws.amazon.com/cdk/
- https://docs.aws.amazon.com/vpc/
