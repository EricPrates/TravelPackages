# 🖥️ Comandos Úteis do Servidor AWS

## 🔌 Conectar no Servidor

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

---

## 📊 Ver Logs do Servidor

```bash
# Logs em tempo real
pm2 logs vendasviagens

# Últimas 50 linhas
pm2 logs vendasviagens --lines 50

# Apenas erros
pm2 logs vendasviagens --err --lines 50
```

---

## 🔄 Gerenciar Servidor

```bash
# Ver status
pm2 list

# Reiniciar
pm2 restart vendasviagens

# Parar
pm2 stop vendasviagens

# Iniciar
pm2 start vendasviagens

# Deletar e recriar
pm2 delete vendasviagens
cd ~/trabalho2/VendasViagens
pm2 start backend/server.js --name vendasviagens
pm2 save
```

---

## 🔍 Verificar Banco de Dados

```bash
cd ~/trabalho2/VendasViagens/db
sqlite3 travel_packages.db

# Dentro do SQLite:
.tables                              # Ver tabelas
.schema purchases                    # Ver estrutura da tabela
SELECT * FROM purchases LIMIT 5;     # Ver dados
.quit                                # Sair
```

---

## 🧪 Testar API

```bash
# Verificar se servidor está rodando
curl http://localhost:4567

# Fazer login
curl -X POST http://localhost:4567/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "senha"}'
```

---

## 🆘 Solução de Problemas

### Porta 4567 em uso

```bash
sudo lsof -i :4567
sudo kill -9 $(sudo lsof -t -i:4567)
pm2 restart vendasviagens
```

### Ver uso de recursos

```bash
# Memória
free -h

# Disco
df -h

# Processos
top
```

### Limpar logs antigos

```bash
pm2 flush
```

---

## 📁 Estrutura no Servidor

```
~/trabalho2/
└── VendasViagens/
    ├── backend/
    │   ├── server.js
    │   ├── services/
    │   ├── routes/
    │   └── models/
    ├── db/
    │   └── travel_packages.db
    └── node_modules/
```

---

## 🔗 Links

- **Servidor:** http://44.219.93.219:4567
- **IP:** 44.219.93.219
- **Porta:** 4567
