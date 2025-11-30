#!/bin/bash

echo "🔄 Sincronizando alterações de beckend/ para VendasViagens/..."

# Copiar arquivos modificados de beckend/ para VendasViagens/
echo "📋 Copiando arquivos do backend..."

# Criar diretórios se não existirem
mkdir -p VendasViagens/backend/services/myServices
mkdir -p VendasViagens/backend/services/myServices/packageComponents
mkdir -p VendasViagens/backend/routes
mkdir -p VendasViagens/backend/utils

# Copiar serviços
cp -f beckend/backend/services/myServices/Auth.js VendasViagens/backend/services/myServices/
cp -f beckend/backend/services/myServices/Dashboard.service.js VendasViagens/backend/services/myServices/
cp -f beckend/backend/services/myServices/Purchase.Service.js VendasViagens/backend/services/myServices/
cp -f beckend/backend/services/myServices/TravelPackage.service.js VendasViagens/backend/services/myServices/
cp -f beckend/backend/services/myServices/Wallet.service.js VendasViagens/backend/services/myServices/
cp -f beckend/backend/services/myServices/User.service.js VendasViagens/backend/services/myServices/

# Copiar componentes de pacote
cp -f beckend/backend/services/myServices/packageComponents/BaseComponent.Service.js VendasViagens/backend/services/myServices/packageComponents/
cp -f beckend/backend/services/myServices/packageComponents/Factory.Service.js VendasViagens/backend/services/myServices/packageComponents/

# Copiar rotas
cp -f beckend/backend/routes/auth.routes.js VendasViagens/backend/routes/
cp -f beckend/backend/routes/dashboard.routes.js VendasViagens/backend/routes/
cp -f beckend/backend/routes/purchase.routes.js VendasViagens/backend/routes/
cp -f beckend/backend/routes/wallet.routes.js VendasViagens/backend/routes/

# Copiar utils
cp -f beckend/backend/utils/airportToCityMapping.js VendasViagens/backend/utils/

# Copiar server.js
cp -f beckend/backend/server.js VendasViagens/backend/

echo "✅ Arquivos copiados!"

# Verificar diferenças
echo ""
echo "📊 Verificando se há diferenças..."
git status VendasViagens/

echo ""
echo "📝 Commitando mudanças..."
git add VendasViagens/
git commit -m "Sync: Atualizar VendasViagens/ com alterações de beckend/ (Dashboard, PurchaseDetails, Auth)"

echo ""
echo "📤 Enviando para repositório..."
git push origin main

# Atualizar servidor AWS
echo ""
echo "🔄 Atualizando servidor AWS..."
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 << 'ENDSSH'
    cd ~/trabalho2
    
    echo "📥 Puxando código atualizado..."
    git pull origin main
    
    echo "📦 Instalando dependências..."
    cd VendasViagens
    npm install
    
    echo "🔄 Reiniciando servidor..."
    pm2 restart vendasviagens || pm2 start backend/server.js --name vendasviagens
    pm2 save
    
    echo "⏳ Aguardando servidor iniciar..."
    sleep 3
    
    echo "📊 Status do servidor:"
    pm2 list
    
    echo ""
    echo "📊 Últimas linhas do log:"
    pm2 logs vendasviagens --lines 20 --nostream
    
    echo ""
    echo "✅ Deploy concluído!"
ENDSSH

echo ""
echo "✅ Sincronização e deploy finalizados!"
echo ""
echo "📊 Para ver os logs em tempo real:"
echo "   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219"
echo "   pm2 logs vendasviagens"
