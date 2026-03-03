#!/bin/bash

# Script de despliegue para diferentes ambientes

set -e

ENVIRONMENT=${1:-dev}
VPC_CIDR=${2:-10.0.0.0/16}

echo "=========================================="
echo "Desplegando ambiente: $ENVIRONMENT"
echo "VPC CIDR: $VPC_CIDR"
echo "=========================================="

# Validar ambiente
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
    echo "Error: Ambiente inválido. Usar: dev, qa, o prod"
    exit 1
fi

# Exportar variables
export ENVIRONMENT=$ENVIRONMENT
export VPC_CIDR=$VPC_CIDR
export AWS_REGION=${AWS_REGION:-us-east-1}

# Bootstrap CDK (solo primera vez)
echo "Verificando bootstrap de CDK..."
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/$AWS_REGION || true

# Sintetizar
echo "Sintetizando stacks..."
npm run synth -- --context environment=$ENVIRONMENT

# Desplegar
echo "Desplegando stacks..."
cdk deploy --all --context environment=$ENVIRONMENT --require-approval never

echo "=========================================="
echo "Despliegue completado exitosamente"
echo "=========================================="
