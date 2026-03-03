#!/bin/bash

# Script para destruir infraestructura

set -e

ENVIRONMENT=${1:-dev}

echo "=========================================="
echo "ADVERTENCIA: Destruyendo ambiente: $ENVIRONMENT"
echo "=========================================="

read -p "¿Estás seguro? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

export ENVIRONMENT=$ENVIRONMENT

echo "Destruyendo stacks..."
cdk destroy --all --context environment=$ENVIRONMENT --force

echo "=========================================="
echo "Infraestructura destruida"
echo "=========================================="
