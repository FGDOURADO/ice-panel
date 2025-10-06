@echo off
echo Configurando deploy para GitHub Pages...

echo.
echo 1. Primeiro, instale o Git se ainda nao tiver:
echo    - Baixe em: https://git-scm.com/download/win
echo    - Instale e reinicie o terminal
echo.

echo 2. Depois execute estes comandos no terminal:
echo.
echo git init
echo git add .
echo git commit -m "Initial commit"
echo git branch -M main
echo git remote add origin https://github.com/SEU-USUARIO/ice-panel.git
echo git push -u origin main
echo.

echo 3. Substitua SEU-USUARIO pelo seu usuario do GitHub
echo.

pause
