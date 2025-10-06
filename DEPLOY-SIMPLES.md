# 🚀 Deploy Simples - Sem Git

## Opção 1: GitHub Desktop (Mais Fácil)

### 1. Instalar GitHub Desktop
- Baixe: https://desktop.github.com/
- Instale e faça login

### 2. Criar repositório
- Clique "Create a new repository"
- Nome: `ice-panel`
- Local path: Escolha uma pasta
- Marque "Initialize this repository with a README"
- Clique "Create repository"

### 3. Copiar arquivos
- Copie todos os arquivos do seu projeto para a pasta do repositório
- No GitHub Desktop, clique "Commit to main"
- Clique "Publish repository"

## Opção 2: Upload Manual (Mais Rápido)

### 1. Criar repositório no GitHub
- Acesse https://github.com
- Clique "New repository"
- Nome: `ice-panel`
- Marque "Public"
- Clique "Create repository"

### 2. Upload dos arquivos
- Clique "uploading an existing file"
- Arraste todos os arquivos do projeto
- Clique "Commit changes"

### 3. Ativar GitHub Pages
- Vá para Settings → Pages
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)
- Clique "Save"

## Opção 3: Netlify (Mais Automático)

### 1. Acessar Netlify
- Vá para https://netlify.com
- Clique "New site from Git"

### 2. Conectar GitHub
- Clique "GitHub"
- Autorize o acesso
- Selecione seu repositório

### 3. Configurar build
- Build command: `npm run build`
- Publish directory: `dist/ice-panel`
- Clique "Deploy site"

## ✅ Resultado
- URL: `https://SEU-USUARIO.github.io/ice-panel` (GitHub)
- URL: `https://NOME-RANDOMICO.netlify.app` (Netlify)
- Gratuito para sempre!
