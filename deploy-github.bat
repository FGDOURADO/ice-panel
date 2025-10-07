@echo off
echo 🚀 Fazendo build para GitHub Pages...
ng build --configuration production --base-href /ice-panel/

echo 📁 Copiando arquivos para a raiz do repositório...
copy "dist\ice-panel\browser\*" ".\" /Y

echo ✅ Arquivos copiados para a raiz!
echo 📂 Agora faça commit e push no Git Desktop
pause
