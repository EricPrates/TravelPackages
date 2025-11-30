#!/bin/bash

echo "🚀 Deploy do Backend para AWS"
echo "=============================="
echo ""

# Verificar se há alterações não commitadas
if [[ -n $(git status -s) ]]; then
    echo "📝 Há alterações não commitadas. Deseja commitar agora? (s/n)"
    read -r resposta
    
    if [[ $resposta == "s" || $resposta == "S" ]]; then
        echo "💬 Digite a mensagem do commit:"
        read -r mensagem
        
        git add .
        git commit -m "$mensagem"
        echo "✅ Commit realizado!"
    else
        echo "⚠️  Continuando sem commitar..."
    fi
fi

# Push para o repositório
echo ""
echo "📤 Enviando código para o repositório..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push. Verifique sua conexão e tente novamente."
    exit 1
fi

echo "✅ Push realizado com sucesso!"

# Deploy no servidor AWS
echo ""
echo "🔄 Fazendo deploy no servidor AWS..."
echo ""

ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 << 'ENDSSH'
    echo "💾 Fazendo backup do banco de dados..."
    cp ~/trabalho2/VendasViagens/db/travel_packages.db ~/trabalho2/VendasViagens/db/travel_packages.db.backup
    
    echo "📥 Atualizando código..."
    cd ~/trabalho2
    git pull origin main
    
    echo ""
    echo "📦 Instalando dependências..."
    cd VendasViagens
    npm install --production
    
    echo ""
    echo "🔄 Reiniciando servidor..."
    pm2 restart vendasviagens
    
    echo ""
    echo "⏳ Aguardando 3 segundos..."
    sleep 3
    
    echo ""
    echo "📊 Status do servidor:"
    pm2 list
    
    echo ""
    echo "📋 Últimas linhas do log:"
    pm2 logs vendasviagens --lines 20 --nostream
    
    echo ""
    echo "✅ Deploy concluído!"
ENDSSH

echo ""
echo "=============================="
echo "✅ Deploy finalizado com sucesso!"
echo ""
echo "📊 Para ver logs em tempo real:"
echo "   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219"
echo "   pm2 logs vendasviagens"
echo ""
echo "🔗 Servidor: http://44.219.93.219:4567"
