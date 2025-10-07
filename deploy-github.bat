@echo off
echo 🚀 Fazendo deploy para GitHub Pages...

echo 📦 Fazendo build...
ng build --configuration production --base-href /ice-panel/

echo 📋 Copiando arquivos...
Copy-Item "dist\ice-panel\browser\*" "." -Force

echo ✅ Deploy concluído!
echo 📝 Faça commit e push no Git Desktop
echo 🌐 Aguarde 5-10 minutos para o GitHub Pages atualizar
pause
