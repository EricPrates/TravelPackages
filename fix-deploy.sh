#!/bin/bash
# Script para corrigir o deploy e iniciar o servidor

echo "🔧 Corrigindo deploy..."

# Navegar para o diretório do projeto
cd ~/trabalho2/beckend

# Verificar se o processo PM2 existe
if pm2 list | grep -q "vendasviagens"; then
    echo "♻️ Processo encontrado, reiniciando..."
    pm2 restart vendasviagens
else
    echo "🆕 Processo não encontrado, iniciando pela primeira vez..."
    pm2 start backend/server.js --name vendasviagens
    pm2 save
fi

# Mostrar status
echo ""
echo "📊 Status dos processos:"
pm2 list

echo ""
echo "✅ Correção concluída!"
echo ""
echo "Para ver os logs: pm2 logs vendasviagens"
echo "Para parar: pm2 stop vendasviagens"
echo "Para reiniciar: pm2 restart vendasviagens"
