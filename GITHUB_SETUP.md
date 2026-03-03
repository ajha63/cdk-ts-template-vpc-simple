# Guía para Subir el Proyecto a GitHub

## Opción 1: Crear Repositorio desde GitHub Web (Recomendado)

### Paso 1: Crear el repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Configura el repositorio:
   - **Repository name**: `aws-vpc-cdk-template` (o el nombre que prefieras)
   - **Description**: "AWS CDK template for VPC deployment with TypeScript"
   - **Visibility**: Elige Public o Private según tu preferencia
   - **NO marques** "Initialize this repository with a README" (ya tenemos uno)
   - **NO agregues** .gitignore ni license (ya los tenemos)
5. Haz clic en **"Create repository"**

### Paso 2: Conectar tu repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará instrucciones. Usa estas:

```bash
# Agregar el remote de GitHub (reemplaza USERNAME con tu usuario)
git remote add origin https://github.com/USERNAME/aws-vpc-cdk-template.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código a GitHub
git push -u origin main
```

### Paso 3: Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos se hayan subido correctamente.

---

## Opción 2: Crear Repositorio usando GitHub CLI

Si tienes [GitHub CLI](https://cli.github.com/) instalado:

```bash
# Autenticarse (si no lo has hecho)
gh auth login

# Crear repositorio público
gh repo create aws-vpc-cdk-template --public --source=. --remote=origin --push

# O crear repositorio privado
gh repo create aws-vpc-cdk-template --private --source=. --remote=origin --push
```

---

## Comandos Git Útiles para el Futuro

### Hacer cambios y subirlos

```bash
# Ver estado de los archivos
git status

# Agregar archivos modificados
git add .

# Hacer commit
git commit -m "feat: descripción del cambio"

# Subir cambios a GitHub
git push
```

### Tipos de commits (Conventional Commits)

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan el código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

### Trabajar con ramas

```bash
# Crear una nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver todas las ramas
git branch -a

# Subir rama a GitHub
git push -u origin feature/nueva-funcionalidad

# Eliminar rama local
git branch -d feature/nueva-funcionalidad
```

### Ver historial

```bash
# Ver commits
git log --oneline --graph --all

# Ver cambios en archivos
git diff

# Ver cambios de un commit específico
git show COMMIT_HASH
```

---

## Configuración Adicional Recomendada

### Proteger la rama main

En GitHub:
1. Ve a **Settings** → **Branches**
2. Agrega una regla para `main`
3. Marca:
   - "Require a pull request before merging"
   - "Require status checks to pass before merging"

### Agregar GitHub Actions (CI/CD)

Crear `.github/workflows/cdk-validate.yml`:

```yaml
name: CDK Validate

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: CDK Synth
        run: npm run synth
```

### Agregar badges al README

Agregar al inicio del README.md:

```markdown
![GitHub](https://img.shields.io/github/license/USERNAME/aws-vpc-cdk-template)
![GitHub last commit](https://img.shields.io/github/last-commit/USERNAME/aws-vpc-cdk-template)
![GitHub issues](https://img.shields.io/github/issues/USERNAME/aws-vpc-cdk-template)
```

---

## Troubleshooting

### Error: "remote origin already exists"

```bash
# Eliminar el remote existente
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/USERNAME/REPO.git
```

### Error: "failed to push some refs"

```bash
# Hacer pull primero
git pull origin main --rebase

# Luego push
git push origin main
```

### Cambiar URL del remote (de HTTPS a SSH o viceversa)

```bash
# Ver URL actual
git remote -v

# Cambiar a SSH
git remote set-url origin git@github.com:USERNAME/REPO.git

# Cambiar a HTTPS
git remote set-url origin https://github.com/USERNAME/REPO.git
```

---

## Configurar SSH (Opcional pero Recomendado)

### Generar clave SSH

```bash
# Generar nueva clave SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Iniciar ssh-agent
eval "$(ssh-agent -s)"

# Agregar clave al ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub
```

### Agregar clave a GitHub

1. Ve a GitHub → **Settings** → **SSH and GPG keys**
2. Clic en **"New SSH key"**
3. Pega la clave pública
4. Guarda

### Usar SSH en lugar de HTTPS

```bash
git remote set-url origin git@github.com:USERNAME/aws-vpc-cdk-template.git
```

---

## Recursos Adicionales

- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI](https://cli.github.com/)
