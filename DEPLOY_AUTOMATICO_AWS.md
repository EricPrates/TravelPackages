# Deploy Automático no AWS EC2

Guia para configurar deploy automático quando você fizer `git push`.

## Método 1: Script Manual (Mais Simples)

### Criar Script de Deploy

Na instância EC2:

```bash
nano ~/deploy.sh
```

Cole este conteúdo:

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."
cd ~/trabalho2
git pull origin main
cd beckend
npm install
pm2 restart vendasviagens
echo "✅ Deploy concluído!"
```

Salve (Ctrl+X, Y, Enter) e torne executável:

```bash
chmod +x ~/deploy.sh
```

### Usar o Script

Sempre que quiser atualizar o servidor:

1. Faça commit e push no seu computador:
```bash
git add .
git commit -m "mensagem"
git push origin main
```

2. Conecte no EC2 e execute:
```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
~/deploy.sh
```

Pronto! Em ~10 segundos o servidor está atualizado.

---

## Método 2: Webhook Automático (Avançado)

Deploy automático sem precisar conectar no servidor!

### Passo 1: Instalar Webhook Listener

Na instância EC2:

```bash
sudo npm install -g webhook
```

### Passo 2: Criar Configuração do Webhook

```bash
mkdir -p ~/webhooks
nano ~/webhooks/hooks.json
```

Cole:

```json
[
  {
    "id": "deploy-backend",
    "execute-command": "/home/ubuntu/deploy.sh",
    "command-working-directory": "/home/ubuntu",
    "response-message": "Deploying backend...",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "SEU_SECRET_AQUI",
        "parameter": {
          "source": "header",
          "name": "X-Gitlab-Token"
        }
      }
    }
  }
]
```

**Importante:** Troque `SEU_SECRET_AQUI` por uma senha forte (ex: `MinhaS3nh4S3gur4!`)

### Passo 3: Iniciar Webhook Listener

```bash
pm2 start webhook --name webhook-listener -- -hooks ~/webhooks/hooks.json -verbose -port 9000
pm2 save
```

Verificar se está rodando:

```bash
pm2 list
```

Deve mostrar `webhook-listener` com status `online`.

### Passo 4: Configurar Security Group

No Console AWS:

1. Vá em **EC2** → **Security Groups**
2. Selecione o grupo **Vendas de Viagens**
3. **Edit inbound rules** → **Add rule**
4. Configure:
   - Type: Custom TCP
   - Port: 9000
   - Source: 0.0.0.0/0
   - Description: Webhook GitLab
5. **Save rules**

### Passo 5: Configurar Webhook no GitLab

1. Acesse seu repositório no GitLab
2. Vá em **Settings** → **Webhooks**
3. Clique em **Add new webhook**
4. Configure:
   - **URL**: `http://44.219.93.219:9000/hooks/deploy-backend`
   - **Secret token**: (a mesma senha que você colocou no hooks.json)
   - **Trigger**: Marque **Push events**
   - **Branch filter**: `main`
   - **SSL verification**: Desmarque (não temos HTTPS)
5. Clique em **Add webhook**

### Passo 6: Testar

Faça um commit e push:

```bash
git add .
git commit -m "teste deploy automático"
git push origin main
```

O GitLab vai chamar o webhook e o servidor vai atualizar automaticamente em ~10 segundos!

Veja os logs:

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
pm2 logs webhook-listener
```

---

## Comparação dos Métodos

| Feature | Script Manual | Webhook Automático |
|---------|---------------|-------------------|
| Facilidade | ✅ Muito fácil | ⚠️ Médio |
| Velocidade | ⚠️ Precisa conectar SSH | ✅ Automático |
| Segurança | ✅ Mais seguro | ⚠️ Expõe porta 9000 |
| Recomendado para | Desenvolvimento | Produção |

---

## Troubleshooting

### Webhook não funciona

Veja os logs:
```bash
pm2 logs webhook-listener
```

Teste manualmente:
```bash
curl -X POST http://44.219.93.219:9000/hooks/deploy-backend \
  -H "X-Gitlab-Token: SEU_SECRET_AQUI"
```

### Deploy falha

Veja os logs do PM2:
```bash
pm2 logs vendasviagens
```

Execute o script manualmente para ver o erro:
```bash
~/deploy.sh
```

### Porta 9000 não acessível

Verifique o Security Group:
```bash
curl http://44.219.93.219:9000/hooks/deploy-backend
```

Se não funcionar, revise as regras de entrada.

---

## Recomendação

Para trabalho acadêmico: Use o **Script Manual** (mais simples e seguro).

Para produção real: Use o **Webhook Automático** (mais profissional).
