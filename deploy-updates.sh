#!/bin/bash

echo "🚀 Fazendo deploy das atualizações para o servidor AWS..."

# Fazer commit das alterações locais
echo "📝 Commitando alterações locais..."
git add .
git commit -m "Fix: Dashboard e PurchaseDetails usando paidInMoney/paidInMiles"

# Enviar para o repositório
echo "📤 Enviando para o repositório..."
git push origin main

# Conectar no servidor e atualizar
echo "🔄 Atualizando servidor AWS..."
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 << 'ENDSSH'
    cd ~/trabalho2
    
    echo "📥 Puxando código atualizado..."
    git pull origin main
    
    echo "📦 Instalando dependências..."
    cd beckend
    npm install
    
    echo "🔄 Reiniciando servidor com PM2..."
    pm2 restart vendasviagens
    
    echo "⏳ Aguardando servidor iniciar..."
    sleep 3
    
    echo "📊 Verificando logs..."
    pm2 logs vendasviagens --lines 20 --nostream
    
    echo "✅ Deploy concluído!"
ENDSSH

echo ""
echo "✅ Deploy finalizado!"
echo "📊 Para ver os logs em tempo real, execute:"
echo "   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219"
echo "   pm2 logs vendasviagens"
