# Pasos Rápidos para Subir a GitHub

## 📋 Resumen Ejecutivo

### 1️⃣ Crear repositorio en GitHub (Web)

1. Ve a: https://github.com/new
2. Configura:
   - **Nombre**: `aws-vpc-cdk-template`
   - **Descripción**: "AWS CDK template for VPC deployment with TypeScript"
   - **Visibilidad**: Public o Private (tu elección)
   - ⚠️ **NO marques** ninguna opción de inicialización
3. Clic en **"Create repository"**

### 2️⃣ Conectar y subir (Terminal)

Después de crear el repo, ejecuta estos comandos (reemplaza `TU-USUARIO`):

```bash
# Agregar remote de GitHub
git remote add origin https://github.com/TU-USUARIO/aws-vpc-cdk-template.git

# Verificar
git remote -v

# Subir código
git push -u origin main
```

### 3️⃣ Verificar

Ve a tu repositorio en GitHub y verifica que todo esté ahí.

---

## 🔐 Autenticación

Cuando hagas `git push`, GitHub te pedirá autenticación:

### Opción A: Personal Access Token (Recomendado)

1. Ve a: https://github.com/settings/tokens
2. Clic en **"Generate new token"** → **"Generate new token (classic)"**
3. Configura:
   - **Note**: "CDK Project"
   - **Expiration**: 90 days (o lo que prefieras)
   - **Scopes**: Marca `repo` (todos los permisos de repositorio)
4. Clic en **"Generate token"**
5. **COPIA EL TOKEN** (no lo volverás a ver)
6. Cuando Git pida password, usa el token en lugar de tu contraseña

### Opción B: SSH (Más seguro, requiere configuración)

Ver archivo `GITHUB_SETUP.md` para instrucciones completas de SSH.

---

## 📝 Comandos para el Día a Día

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "feat: descripción del cambio"

# Subir a GitHub
git push

# Bajar cambios de GitHub
git pull
```

---

## 🚀 Siguiente Paso (Opcional)

Si quieres instalar GitHub CLI para facilitar el trabajo:

```bash
# En macOS con Homebrew
brew install gh

# Autenticarse
gh auth login

# Crear repos directamente desde terminal
gh repo create nombre-repo --public --source=. --push
```

---

## ❓ ¿Problemas?

Consulta el archivo `GITHUB_SETUP.md` para troubleshooting detallado.
