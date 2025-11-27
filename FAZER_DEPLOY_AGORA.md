# 🚀 FAZER DEPLOY AGORA!

## ❌ Problema Identificado:

O servidor AWS está com **código antigo**. O erro mostra que a variável `description` não está definida na linha 188, mas no código atual ela está correta.

**Solução:** Fazer deploy do código novo!

---

## 🎯 Solução Rápida (3 passos):

### 1. Commit e Push (no seu computador):

```bash
cd /mnt/c/Users/ericp/trabalho2
git add .
git commit -m "fix: corrigir createBasePackage com description"
git push origin main
```

### 2. Conectar no servidor AWS:

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

### 3. Atualizar o servidor:

```bash
cd ~/trabalho2
git pull origin main
cd beckend
npm install
pm2 restart vendasviagens
pm2 logs vendasviagens
```

---

## ✅ Ou use o script automático:

No servidor AWS, execute:

```bash
~/deploy.sh
```

Se o script não existir, crie:

```bash
nano ~/deploy.sh
```

Cole:

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."
cd ~/trabalho2
git pull origin main
cd beckend
npm install

if pm2 list | grep -q "vendasviagens"; then
    echo "♻️ Reiniciando processo existente..."
    pm2 restart vendasviagens
else
    echo "🆕 Iniciando novo processo..."
    pm2 start backend/server.js --name vendasviagens
    pm2 save
fi

echo "✅ Deploy concluído!"
pm2 logs vendasviagens --lines 20
```

Salve (Ctrl+X, Y, Enter) e execute:

```bash
chmod +x ~/deploy.sh
~/deploy.sh
```

---

## 🧪 Testar depois do deploy:

1. Aguarde o servidor reiniciar (~5 segundos)
2. Tente criar o pacote novamente no app
3. Deve funcionar! ✅

---

## 📊 Verificar se funcionou:

```bash
pm2 logs vendasviagens --lines 20
```

Deve aparecer:
```
✅ Pacote criado: 1
```

Sem erros de `description is not defined`!

---

## 🎯 Resumo:

**O código está correto no seu computador, mas o servidor AWS está desatualizado!**

Execute:
1. `git push` (no seu PC)
2. `git pull` (no servidor)
3. `pm2 restart vendasviagens` (no servidor)

Pronto! 🚀
