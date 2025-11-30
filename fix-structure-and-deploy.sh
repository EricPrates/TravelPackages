#!/bin/bash

echo "🔧 Corrigindo estrutura do projeto e fazendo deploy..."

# 1. Commitar as mudanças locais
echo "📝 Commitando mudanças (deletar beckend/, adicionar VendasViagens/)..."
git add -A
git commit -m "Refactor: Consolidar estrutura em VendasViagens/ e remover beckend/"
git push origin main

# 2. Atualizar servidor AWS
echo "🔄 Atualizando servidor AWS..."
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 << 'ENDSSH'
    cd ~/trabalho2
    
    echo "📥 Puxando código atualizado..."
    git pull origin main
    
    echo "🔄 Parando processo antigo..."
    pm2 delete vendasviagens 2>/dev/null || true
    
    echo "📦 Instalando dependências na nova estrutura..."
    cd VendasViagens
    npm install
    
    echo "🚀 Iniciando servidor com PM2..."
    pm2 start backend/server.js --name vendasviagens
    pm2 save
    
    echo "⏳ Aguardando servidor iniciar..."
    sleep 3
    
    echo "📊 Verificando status..."
    pm2 list
    
    echo ""
    echo "📊 Logs do servidor:"
    pm2 logs vendasviagens --lines 20 --nostream
    
    echo ""
    echo "✅ Deploy concluído!"
ENDSSH

echo ""
echo "✅ Processo finalizado!"
echo ""
echo "📊 Para ver os logs em tempo real:"
echo "   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219"
echo "   pm2 logs vendasviagens"
