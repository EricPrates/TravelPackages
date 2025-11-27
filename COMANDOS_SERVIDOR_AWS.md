# 🖥️ Comandos para o Servidor AWS

## 🔌 Conectar no Servidor

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

---

## 📋 Verificar Status do Servidor

### Opção 1: Verificar se PM2 está instalado

```bash
which pm2
# Se retornar um caminho, está instalado
# Se não retornar nada, precisa instalar
```

### Opção 2: Instalar PM2 (se não estiver instalado)

```bash
sudo npm install -g pm2
```

### Opção 3: Ver processos Node rodando

```bash
ps aux | grep node
```

---

## 📊 Ver Logs do Servidor

### Se PM2 estiver instalado:

```bash
pm2 logs vendasviagens --lines 50
```

### Se PM2 não estiver instalado:

```bash
# Ver logs do sistema
sudo journalctl -u vendasviagens -n 50 --no-pager

# Ou ver logs do Node diretamente
cd ~/trabalho2/beckend
node backend/server.js
# (Ctrl+C para parar)
```

---

## 🔄 Reiniciar o Servidor

### Com PM2:

```bash
pm2 restart vendasviagens
pm2 logs vendasviagens
```

### Sem PM2 (manual):

```bash
# Parar processo atual
pkill -f "node.*server.js"

# Iniciar novamente
cd ~/trabalho2/beckend
nohup node backend/server.js > server.log 2>&1 &

# Ver logs
tail -f ~/trabalho2/beckend/server.log
```

---

## 🧪 Testar API Diretamente

### Teste 1: Verificar se servidor está rodando

```bash
curl http://localhost:4567
# Deve retornar: "Bem vindo as Vendas de viagens!"
```

### Teste 2: Fazer login e pegar token

```bash
curl -X POST http://localhost:4567/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@exemplo.com",
    "password": "sua_senha"
  }'
```

Copie o `accessToken` da resposta.

### Teste 3: Criar pacote com o token

```bash
TOKEN="cole_o_token_aqui"

curl -X POST http://localhost:4567/travel-packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "destination": "Paris",
    "origin": "Rio de Janeiro",
    "departureDate": "2025-12-30",
    "returnDate": "2026-01-30",
    "description": "Teste",
    "numberOfTravelers": 1
  }'
```

---

## 🔍 Verificar Banco de Dados

```bash
cd ~/trabalho2/beckend/db
sqlite3 travel_packages.db

# Dentro do SQLite:
.tables
.schema travel_packages
SELECT * FROM travel_packages LIMIT 5;
.quit
```

---

## 📝 Ver Estrutura do Projeto

```bash
cd ~/trabalho2
ls -la
cd beckend
ls -la
cd backend
ls -la
```

---

## 🚀 Script Completo de Deploy

```bash
#!/bin/bash
echo "🚀 Atualizando servidor..."

# Ir para o diretório
cd ~/trabalho2

# Puxar código novo
git pull origin main

# Instalar dependências
cd beckend
npm install

# Parar servidor antigo
pkill -f "node.*server.js"

# Iniciar servidor novo
nohup node backend/server.js > server.log 2>&1 &

# Aguardar 2 segundos
sleep 2

# Verificar se está rodando
if curl -s http://localhost:4567 > /dev/null; then
    echo "✅ Servidor rodando!"
else
    echo "❌ Erro ao iniciar servidor"
    tail -20 server.log
fi
```

Salve como `~/deploy-manual.sh` e execute:

```bash
chmod +x ~/deploy-manual.sh
~/deploy-manual.sh
```

---

## 🆘 Comandos de Emergência

### Ver porta 4567 em uso:

```bash
sudo lsof -i :4567
```

### Matar processo na porta 4567:

```bash
sudo kill -9 $(sudo lsof -t -i:4567)
```

### Ver uso de memória:

```bash
free -h
```

### Ver uso de disco:

```bash
df -h
```

---

## 📞 Resumo Rápido

**Para ver o erro do seu pacote:**

1. Conecte no servidor:
   ```bash
   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
   ```

2. Veja os logs:
   ```bash
   cd ~/trabalho2/beckend
   tail -f server.log
   ```
   
   OU (se tiver PM2):
   ```bash
   pm2 logs vendasviagens
   ```

3. Tente criar o pacote novamente no app

4. O erro vai aparecer nos logs!

---

## 🎯 Comando Mais Simples

Se você só quer ver o erro rapidamente:

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 "tail -50 ~/trabalho2/beckend/server.log"
```

Isso conecta, mostra as últimas 50 linhas do log e desconecta automaticamente!
