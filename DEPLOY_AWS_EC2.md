# Deploy no AWS EC2 (SQLite Persistente) - Guia Completo

Este guia documenta o processo completo de deploy do backend na AWS EC2 com SQLite que **persiste** os dados.

## ✅ O que foi feito e funcionou

### Informações da Instância

- **Nome**: Calculator-homologi
- **Tipo**: t3.small
- **IP Público**: 44.219.93.219
- **Sistema**: Ubuntu 24.04 LTS
- **Chave SSH**: Aws_vianna_2025_teste.pem
- **Security Group**: Vendas de Viagens (sg-09347beeebd325e25)
- **URL do Backend**: http://44.219.93.219:4567

## Passo 1: Conectar na Instância EC2

### Opção A: Via SSH (WSL/Linux/Mac)

```bash
# No WSL, copie a chave se necessário
cp /mnt/c/Users/ericp/OneDrive/Área\ de\ Trabalho/3e4Peridodo/Mobile/Trabalho2/Aws_vianna_2025_teste.pem ~/
chmod 400 ~/Aws_vianna_2025_teste.pem

# Conectar
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

### Opção B: Via Console AWS (Mais Fácil)

1. Acesse o Console AWS Academy
2. Vá em **EC2** → **Instances**
3. Selecione **Calculator-homologi**
4. Clique em **Connect** (botão laranja)
5. Escolha **EC2 Instance Connect**
6. Clique em **Connect**

## Passo 2: Instalar Node.js (Já feito - pular se já instalado)

```bash
# Atualizar sistema
sudo apt update

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v22.x.x
npm --version
```

## Passo 3: Clonar Repositório (Já feito - pular se já existe)

```bash
# Instalar Git
sudo apt install git -y

# Clonar repositório
git clone https://gitlab.com/aula-daves/vianna/2025-2/mobile/eric.prates/trabalho2.git

# Entrar na pasta do backend
cd trabalho2/beckend

# Instalar dependências
npm install
```

## Passo 4: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

Cole este conteúdo:

```env
NODE_ENV=production
PORT=4567
JWT_PRIVATE_KEY=Ep99661858
JWT_REFRESH_KEY=Er99661858
API_KEY=GFPBIZiMk35pzXjP71xAo5hTq2Vtzs6j
API_SECRET=E9eT1aMFKA1598YR
GOOGLE_ID=722748073420-92sa43m47s09rtpkomrojpkvnv391v99.apps.googleusercontent.com
GOOGLE_SECRET=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
GOOGLE_REDIRECT_URI=http://44.219.93.219:4567/auth/google/callback
```

Salve com **Ctrl+X**, depois **Y**, depois **Enter**.

## Passo 5: Instalar e Configurar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar o servidor
pm2 start backend/server.js --name vendasviagens

# Salvar configuração
pm2 save

# Configurar auto-start
pm2 startup

# Copie e execute o comando que aparecer (algo como):
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Passo 6: Configurar Security Group

1. No Console AWS, vá em **EC2** → **Security Groups**
2. Selecione **Vendas de Viagens** (sg-09347beeebd325e25)
3. Vá na aba **Inbound rules**
4. Clique em **Edit inbound rules**
5. Certifique-se que tem estas regras:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| Custom TCP | TCP | 4567 | 0.0.0.0/0 | Backend Node.js |
| SSH | TCP | 22 | 0.0.0.0/0 | SSH Access |

6. Clique em **Save rules**

## Passo 7: Testar

Acesse no navegador:
```
http://44.219.93.219:4567/
```

Deve aparecer: **"Bem vindo as Vendas de viagens!"**

## Passo 8: Atualizar Frontend

No arquivo `frontend/src/AuthContext.jsx`, mude a URL:

```javascript
const URL = 'http://44.219.93.219:4567';
```

## Passo 9: Atualizar Google Cloud Console

Adicione nos URIs de redirecionamento autorizados:
```
http://44.219.93.219:4567/auth/google/callback
```

---

## 🔄 Como Reconectar na Instância

### Via SSH (WSL):
```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

### Via Console AWS:
1. EC2 → Instances → Calculator-homologi
2. Connect → EC2 Instance Connect → Connect

---

## 📝 Comandos Úteis do PM2

### Ver status dos processos:
```bash
pm2 status
```

### Ver logs em tempo real:
```bash
pm2 logs vendasviagens
```

### Reiniciar o servidor:
```bash
pm2 restart vendasviagens
```

### Parar o servidor:
```bash
pm2 stop vendasviagens
```

### Iniciar o servidor:
```bash
pm2 start vendasviagens
```

### Ver logs antigos:
```bash
pm2 logs vendasviagens --lines 100
```

### Monitorar recursos:
```bash
pm2 monit
```

---

## 🔄 Como Atualizar o Código

Quando você fizer mudanças no código:

```bash
# Conectar na instância
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219

# Ir para a pasta do projeto
cd trabalho2/beckend

# Fazer pull das mudanças
git pull origin main

# Instalar novas dependências (se houver)
npm install

# Reiniciar o servidor
pm2 restart vendasviagens

# Ver logs para confirmar
pm2 logs vendasviagens
```

---

## ⚠️ Possíveis Problemas e Soluções

### 1. "Permission denied (publickey)" ao conectar via SSH

**Causa:** Chave SSH não encontrada ou sem permissões corretas.

**Solução:**
```bash
# Copiar chave para o WSL
cp /mnt/c/Users/ericp/OneDrive/Área\ de\ Trabalho/3e4Peridodo/Mobile/Trabalho2/Aws_vianna_2025_teste.pem ~/

# Ajustar permissões
chmod 400 ~/Aws_vianna_2025_teste.pem

# Tentar novamente
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
```

**Alternativa:** Use EC2 Instance Connect pelo Console AWS.

---

### 2. "Connection refused" ao acessar http://44.219.93.219:4567

**Causa:** Servidor não está rodando ou Security Group não permite acesso.

**Solução:**

1. Verificar se o servidor está rodando:
```bash
pm2 status
```

Se não estiver rodando:
```bash
pm2 start vendasviagens
```

2. Verificar Security Group:
   - EC2 → Security Groups → Vendas de Viagens
   - Inbound rules deve ter porta 4567 aberta para 0.0.0.0/0

3. Verificar se o servidor responde localmente:
```bash
curl http://localhost:4567/
```

---

### 3. Servidor parou de funcionar após reiniciar a instância

**Causa:** PM2 não configurado para auto-start.

**Solução:**
```bash
pm2 startup
# Execute o comando que aparecer
pm2 save
```

---

### 4. "Database is locked" ou erros de SQLite

**Causa:** Múltiplas instâncias tentando acessar o banco.

**Solução:**
```bash
# Ver processos rodando
pm2 status

# Se tiver múltiplas instâncias, deletar as extras
pm2 delete <id>

# Manter apenas uma instância
pm2 restart vendasviagens
```

---

### 5. Mudanças no código não aparecem

**Causa:** Código não foi atualizado ou servidor não foi reiniciado.

**Solução:**
```bash
cd trabalho2/beckend
git pull origin main
npm install
pm2 restart vendasviagens
pm2 logs vendasviagens
```

---

### 6. "Port 4567 already in use"

**Causa:** Outro processo usando a porta.

**Solução:**
```bash
# Ver o que está usando a porta
sudo lsof -i :4567

# Matar o processo (substitua PID pelo número que aparecer)
kill -9 <PID>

# Ou reiniciar PM2
pm2 restart vendasviagens
```

---

### 7. IP da instância mudou

**Causa:** Instância foi parada e reiniciada (IP público muda).

**Solução:**

1. Ver novo IP no Console AWS (EC2 → Instances)
2. Atualizar frontend com novo IP
3. Atualizar Google Cloud Console com novo IP
4. Atualizar `.env` na instância:
```bash
nano .env
# Mudar GOOGLE_REDIRECT_URI para novo IP
pm2 restart vendasviagens
```

**Prevenção:** Use Elastic IP (IP fixo) - mas pode ter custo.

---

### 8. Instância parada/terminada

**Causa:** AWS Academy pode parar instâncias automaticamente.

**Solução:**

1. No Console AWS, vá em EC2 → Instances
2. Selecione a instância
3. Actions → Instance State → Start
4. Aguarde iniciar
5. Verifique o novo IP público
6. Atualize frontend e Google Console com novo IP

---

### 9. Sem espaço em disco

**Causa:** Logs ou arquivos temporários ocupando espaço.

**Solução:**
```bash
# Ver uso de disco
df -h

# Limpar logs do PM2
pm2 flush

# Limpar cache do npm
npm cache clean --force

# Limpar logs do sistema
sudo journalctl --vacuum-time=3d
```

---

### 10. Erro "jwt malformed" no frontend

**Causa:** Token não está sendo enviado corretamente.

**Solução:**

Verificar se o frontend está pegando o token corretamente:
```javascript
// Deve ser assim:
token: data.data.token.accessToken
```

---

## 💰 Custos e Créditos AWS

- **Instância t3.small**: ~$0.02/hora = ~$15/mês
- **Crédito AWS Academy**: $40
- **Duração estimada**: ~2-3 meses com $40

**Dica:** Pare a instância quando não estiver usando para economizar créditos:
- EC2 → Instances → Actions → Instance State → Stop

---

## 🔒 Segurança

### Recomendações:

1. **Não compartilhe a chave SSH** (Aws_vianna_2025_teste.pem)
2. **Não commite o .env** no Git
3. **Use HTTPS em produção** (configure certificado SSL)
4. **Restrinja SSH** no Security Group para seu IP apenas
5. **Atualize o sistema** regularmente:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 📊 Monitoramento

### Ver uso de recursos:
```bash
# CPU e memória
htop

# Espaço em disco
df -h

# Processos
pm2 monit
```

### Ver logs do sistema:
```bash
sudo journalctl -u pm2-ubuntu -f
```

---

## 🎯 Checklist de Deploy

- [x] Instância EC2 criada e rodando
- [x] Node.js 22 instalado
- [x] Repositório clonado
- [x] Dependências instaladas (`npm install`)
- [x] Arquivo `.env` configurado
- [x] PM2 instalado e configurado
- [x] Servidor rodando (`pm2 start`)
- [x] Auto-start configurado (`pm2 startup`)
- [x] Security Group com porta 4567 aberta
- [x] Testado no navegador (http://44.219.93.219:4567)
- [x] Frontend atualizado com novo URL
- [x] Google Cloud Console atualizado

---

## 📚 Recursos Úteis

- [Documentação PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Pronto!** Seu backend está rodando na AWS EC2 com SQLite persistente. O banco de dados não será apagado e vai persistir entre reinicializações da instância.
