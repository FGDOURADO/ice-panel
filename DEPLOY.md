# 🚀 Como fazer Deploy no GitHub Pages

## Passo 1: Instalar Git
1. Baixe o Git em: https://git-scm.com/download/win
2. Instale e reinicie o terminal
3. Verifique se instalou: `git --version`

## Passo 2: Criar repositório no GitHub
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `ice-panel`
4. Marque "Public"
5. NÃO marque "Add README"
6. Clique "Create repository"

## Passo 3: Fazer upload do código
Execute estes comandos no terminal (substitua SEU-USUARIO):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/ice-panel.git
git push -u origin main
```

## Passo 4: Ativar GitHub Pages
1. Vá para Settings do repositório
2. Role até "Pages"
3. Em "Source", selecione "GitHub Actions"
4. Aguarde o deploy automático

## Passo 5: Acessar seu site
- URL será: `https://SEU-USUARIO.github.io/ice-panel`
- Pode levar alguns minutos para ficar disponível

## Passo 6: Atualizar imagens
1. Edite o arquivo `src/app/services/github-images.service.ts`
2. Substitua as URLs pelas suas imagens do GitHub
3. Faça commit e push das mudanças
4. O site será atualizado automaticamente

## ✅ Pronto!
Seu site estará funcionando gratuitamente no GitHub Pages!
