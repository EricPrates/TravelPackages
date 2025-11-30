#!/bin/bash

echo "🔍 Comparando estruturas beckend/ e VendasViagens/..."

echo ""
echo "📁 Arquivos em beckend/backend/services/myServices/:"
ls -la beckend/backend/services/myServices/ 2>/dev/null || echo "Pasta não existe"

echo ""
echo "📁 Arquivos em VendasViagens/backend/services/myServices/:"
ls -la VendasViagens/backend/services/myServices/ 2>/dev/null || echo "Pasta não existe"

echo ""
echo "🔍 Comparando Auth.js..."
if [ -f beckend/backend/services/myServices/Auth.js ] && [ -f VendasViagens/backend/services/myServices/Auth.js ]; then
    diff -q beckend/backend/services/myServices/Auth.js VendasViagens/backend/services/myServices/Auth.js
    if [ $? -eq 0 ]; then
        echo "✅ Arquivos são idênticos"
    else
        echo "❌ Arquivos são diferentes"
        echo "   Linhas diferentes:"
        diff beckend/backend/services/myServices/Auth.js VendasViagens/backend/services/myServices/Auth.js | head -20
    fi
else
    echo "⚠️  Um ou ambos os arquivos não existem"
fi

echo ""
echo "🔍 Comparando Dashboard.service.js..."
if [ -f beckend/backend/services/myServices/Dashboard.service.js ] && [ -f VendasViagens/backend/services/myServices/Dashboard.service.js ]; then
    diff -q beckend/backend/services/myServices/Dashboard.service.js VendasViagens/backend/services/myServices/Dashboard.service.js
    if [ $? -eq 0 ]; then
        echo "✅ Arquivos são idênticos"
    else
        echo "❌ Arquivos são diferentes"
    fi
else
    echo "⚠️  Um ou ambos os arquivos não existem"
fi

echo ""
echo "🔍 Comparando Purchase.Service.js..."
if [ -f beckend/backend/services/myServices/Purchase.Service.js ] && [ -f VendasViagens/backend/services/myServices/Purchase.Service.js ]; then
    diff -q beckend/backend/services/myServices/Purchase.Service.js VendasViagens/backend/services/myServices/Purchase.Service.js
    if [ $? -eq 0 ]; then
        echo "✅ Arquivos são idênticos"
    else
        echo "❌ Arquivos são diferentes"
    fi
else
    echo "⚠️  Um ou ambos os arquivos não existem"
fi

echo ""
echo "✅ Comparação concluída!"
