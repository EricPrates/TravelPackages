#!/bin/bash

echo "🔄 Atualizando servidor AWS..."

ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 << 'ENDSSH'
    cd ~/trabalho2
    
    echo "📥 Puxando código atualizado..."
    git pull origin main
    
    echo "🔍 Verificando estrutura..."
    ls -la
    
    echo ""
    echo "📦 Instalando dependências em VendasViagens/..."
    cd VendasViagens
    npm install
    
    echo ""
    echo "🔄 Parando processo antigo..."
    pm2 delete vendasviagens 2>/dev/null || echo "Processo não estava rodando"
    
    echo ""
    echo "🚀 Iniciando servidor..."
    pm2 start backend/server.js --name vendasviagens
    pm2 save
    
    echo ""
    echo "⏳ Aguardando 3 segundos..."
    sleep 3
    
    echo ""
    echo "📊 Status do PM2:"
    pm2 list
    
    echo ""
    echo "📊 Logs do servidor:"
    pm2 logs vendasviagens --lines 30 --nostream
    
    echo ""
    echo "✅ Atualização concluída!"
ENDSSH

echo ""
echo "✅ Servidor atualizado!"
echo ""
echo "📊 Para ver logs em tempo real:"
echo "   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219"
echo "   pm2 logs vendasviagens"
