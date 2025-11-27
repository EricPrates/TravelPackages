# 🔧 Corrigir Erro do Deploy

## O que aconteceu?

O erro `[PM2][ERROR] Process or Namespace vendasviagens not found` acontece porque é o primeiro deploy e o processo ainda não existe no PM2.

## Solução Rápida

### Opção 1: Comando Direto (Mais Rápido)

Conecte no servidor e execute:

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
cd ~/trabalho2/beckend
pm2 start backend/server.js --name vendasviagens
pm2 save
```

Pronto! Agora o processo está rodando.

### Opção 2: Usar Script Automático

1. **Copie o script para o servidor:**

```bash
scp -i ~/Aws_vianna_2025_teste.pem fix-deploy.sh ubuntu@44.219.93.219:~/
```

2. **Conecte no servidor e execute:**

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
chmod +x ~/fix-deploy.sh
~/fix-deploy.sh
```

### Opção 3: Atualizar o Script de Deploy

O script `deploy.sh` já foi atualizado no arquivo `DEPLOY_AUTOMATICO_AWS.md`. 

**Atualize o script no servidor:**

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
nano ~/deploy.sh
```

Cole o novo conteúdo:

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."
cd ~/trabalho2
git pull origin main
cd beckend
npm install

# Verifica se o processo existe antes de reiniciar
if pm2 list | grep -q "vendasviagens"; then
    echo "♻️ Reiniciando processo existente..."
    pm2 restart vendasviagens
else
    echo "🆕 Iniciando novo processo..."
    pm2 start backend/server.js --name vendasviagens
    pm2 save
fi

echo "✅ Deploy concluído!"
```

Salve (Ctrl+X, Y, Enter) e execute:

```bash
~/deploy.sh
```

---

## Verificar se está funcionando

```bash
# Ver processos rodando
pm2 list

# Ver logs em tempo real
pm2 logs vendasviagens

# Testar a API
curl http://localhost:4567
```

Deve retornar: `Bem vindo as Vendas de viagens!`

---

## Comandos Úteis do PM2

```bash
# Ver status
pm2 list

# Ver logs
pm2 logs vendasviagens

# Parar processo
pm2 stop vendasviagens

# Reiniciar processo
pm2 restart vendasviagens

# Remover processo
pm2 delete vendasviagens

# Salvar configuração (para reiniciar após reboot)
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

---

## Por que isso aconteceu?

O PM2 precisa que o processo seja **iniciado** (`pm2 start`) na primeira vez. Depois disso, você pode usar `pm2 restart` para reiniciar.

O script antigo tentava fazer `pm2 restart` sem verificar se o processo existia, causando o erro.

O novo script verifica se o processo existe:
- ✅ Se existe → faz `restart`
- ✅ Se não existe → faz `start`

Agora funciona em qualquer situação! 🚀
