# 🚀 Deploy do Backend para AWS

## 📋 Pré-requisitos
- Código commitado e enviado para o Git
- Acesso SSH ao servidor AWS

---

## 🔄 Deploy Rápido (Passo a Passo)

### 1️⃣ No seu computador local

```bash
# Commitar alterações
git add .
git commit -m "Sua mensagem de commit"
git push origin main
```

### 2️⃣ Conectar no servidor AWS

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

### 3️⃣ No servidor AWS, executar:

```bash
cd ~/trabalho2
git pull origin main
cd VendasViagens
npm install
pm2 restart vendasviagens
pm2 logs vendasviagens
```

---

## 🎯 Deploy em Um Comando

Execute do seu computador local (depois de fazer commit/push):

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 "cd ~/trabalho2 && git pull origin main && cd VendasViagens && npm install && pm2 restart vendasviagens && pm2 logs vendasviagens --lines 30 --nostream"
```
conectar e startar ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 "cd ~/trabalho2/VendasViagens/backend && pm2 start server.js --name vendasviagens"

---

## 📊 Verificar Status

```bash
# Conectar no servidor
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219

# Ver logs em tempo real
pm2 logs vendasviagens

# Ver status
pm2 list

# Reiniciar se necessário
pm2 restart vendasviagens
```

---

## 🆘 Solução de Problemas

### Servidor não inicia

```bash
# Ver erros
pm2 logs vendasviagens --err --lines 50

# Parar e iniciar novamente
pm2 delete vendasviagens
cd ~/trabalho2/VendasViagens
pm2 start backend/server.js --name vendasviagens
pm2 save
```

### Código não atualizou

```bash
cd ~/trabalho2
git status
git pull origin main --force
```

### Porta 4567 em uso

```bash
sudo lsof -i :4567
sudo kill -9 $(sudo lsof -t -i:4567)
pm2 restart vendasviagens
```

---

## 📁 Estrutura no Servidor

```
~/trabalho2/
└── VendasViagens/
    ├── backend/
    │   └── server.js          ← Servidor rodando aqui
    ├── db/
    │   └── travel_packages.db ← Banco de dados
    └── node_modules/
```

---

## ✅ Checklist de Deploy

- [ ] Código testado localmente
- [ ] Commit feito: `git commit -m "mensagem"`
- [ ] Push feito: `git push origin main`
- [ ] Conectado no servidor AWS
- [ ] Git pull executado
- [ ] npm install executado (se houver novas dependências)
- [ ] PM2 reiniciado
- [ ] Logs verificados
- [ ] App testado

---

## 🔗 Links Úteis

- **Servidor:** http://44.219.93.219:4567
- **API Base:** http://44.219.93.219:4567
- **Health Check:** http://44.219.93.219:4567/

---

## 💡 Dicas

1. **Sempre faça backup do banco antes de deploy importante:**
   ```bash
   scp -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219:~/trabalho2/VendasViagens/db/travel_packages.db ./backup_$(date +%Y%m%d).db
   ```

2. **Ver últimas alterações no servidor:**
   ```bash
   ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219 "cd ~/trabalho2 && git log -5 --oneline"
   ```

3. **Testar API rapidamente:**
   ```bash
   curl http://44.219.93.219:4567
   ```
