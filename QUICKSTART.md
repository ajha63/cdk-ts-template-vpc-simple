# Guía de Inicio Rápido

## 1. Instalación

```bash
# Instalar dependencias
npm install

# Instalar AWS CDK CLI globalmente (si no lo tienes)
npm install -g aws-cdk
```

## 2. Configurar AWS

```bash
# Configurar credenciales de AWS
aws configure

# Verificar configuración
aws sts get-caller-identity
```

## 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
# ENVIRONMENT=dev
# AWS_REGION=us-east-1
# VPC_CIDR=10.0.0.0/16
# TEAM=DevOps
# COST_CENTER=CC-001
```

## 4. Bootstrap CDK (Solo Primera Vez)

```bash
# Bootstrap en la región us-east-1
cdk bootstrap aws://ACCOUNT-ID/us-east-1

# O usar el script
./scripts/deploy.sh dev
```

## 5. Desplegar

### Opción A: Usando npm scripts

```bash
# Ambiente dev con valores por defecto
npm run deploy

# Ver qué se va a crear
npm run synth
```

### Opción B: Usando CDK directamente

```bash
# Desplegar ambiente dev
cdk deploy --all --context environment=dev

# Desplegar ambiente prod con CIDR personalizado
VPC_CIDR=172.16.0.0/16 cdk deploy --all --context environment=prod
```

### Opción C: Usando el script de despliegue

```bash
# Ambiente dev con CIDR por defecto
./scripts/deploy.sh dev

# Ambiente prod con CIDR personalizado
./scripts/deploy.sh prod 172.16.0.0/16
```

## 6. Verificar Recursos Creados

```bash
# Listar stacks
cdk ls

# Ver outputs
aws cloudformation describe-stacks --stack-name dev-networking-stack --query 'Stacks[0].Outputs'
```

## 7. Activar NAT Instances (Opcional)

Las NAT Instances se crean apagadas. Para activarlas:

```bash
# Obtener ID de la instancia NAT
NAT_INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name dev-networking-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`NatInstance1Id`].OutputValue' \
  --output text)

# Iniciar la instancia
aws ec2 start-instances --instance-ids $NAT_INSTANCE_ID
```

## 8. Destruir Infraestructura

```bash
# Opción A: Usando npm
npm run destroy

# Opción B: Usando CDK
cdk destroy --all --context environment=dev

# Opción C: Usando el script
./scripts/destroy.sh dev
```

## Estructura de Subnets Creadas

Para VPC CIDR `10.0.0.0/16`:

### Zona de Disponibilidad 1 (us-east-1a)
- `10.0.0.0/24` - Subnet Pública 1
- `10.0.1.0/24` - Subnet Pública 2
- `10.0.2.0/24` - Subnet Privada App
- `10.0.3.0/24` - Subnet Privada DB

### Zona de Disponibilidad 2 (us-east-1b)
- `10.0.8.0/24` - Subnet Pública 1
- `10.0.9.0/24` - Subnet Pública 2
- `10.0.10.0/24` - Subnet Privada App
- `10.0.11.0/24` - Subnet Privada DB

## Próximos Pasos

1. Revisar los outputs de CloudFormation para obtener IDs de recursos
2. Agregar stacks adicionales (EC2, RDS, etc.) según necesidad
3. Configurar monitoring y alertas
4. Implementar backup y disaster recovery

## Troubleshooting

### Error: "CDK not bootstrapped"
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Error: "Insufficient permissions"
Verificar que tu usuario IAM tenga permisos para crear VPC, EC2, Security Groups, etc.

### Error: "CIDR overlap"
Asegurarse de que el CIDR de la VPC no se solape con otras VPCs en la cuenta.

## Comandos Útiles

```bash
# Ver diferencias antes de desplegar
cdk diff

# Sintetizar sin desplegar
cdk synth

# Listar todos los stacks
cdk ls

# Ver metadata de un stack
cdk metadata dev-networking-stack

# Compilar TypeScript
npm run build

# Modo watch (recompila automáticamente)
npm run watch
```
