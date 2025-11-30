# Documentação da API - Sistema de Vendas de Viagens

Base URL: `http://44.219.93.219:4567`

## 📋 Índice
- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Pacotes](#pacotes)
- [Compras](#compras)
- [Carteira](#carteira)
- [Dashboard](#dashboard)

---

## 🔐 Autenticação

### Registro de Usuário
```bash
curl -X POST http://44.219.93.219:4567/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "agent"
  }'
```

**Resposta**:
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso.",
  "data": {
    "user": {
      "id": 1,
      "email": "joao@example.com",
      "name": "João Silva",
      "role": "agent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

### Login
```bash
curl -X POST http://44.219.93.219:4567/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "joao@example.com",
      "role": "agent",
      "name": "João Silva"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expiresIn": "15m"
    },
    "wallet": {
      "id": 1,
      "balanceCash": 5000.00,
      "balanceMiles": 10000
    }
  }
}
```

### Renovar Token
```bash
curl -X POST http://44.219.93.219:4567/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Logout
```bash
curl -X POST http://44.219.93.219:4567/auth/logout \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Login com Google
```bash
# 1. Obter URL de autenticação
curl http://44.219.93.219:4567/auth/google/url

# 2. Redirecionar usuário para a URL retornada
# 3. Google redireciona para /auth/google/callback com o código
```

---

## 👤 Usuários

### Buscar Usuário por ID
```bash
curl -X GET http://44.219.93.219:4567/users/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📦 Pacotes

### Listar Todos os Pacotes
```bash
curl -X GET http://44.219.93.219:4567/packages \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Pacote por ID
```bash
curl -X GET http://44.219.93.219:4567/packages/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Pacote (Agente)
```bash
curl -X POST http://44.219.93.219:4567/packages \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paris Romântico",
    "description": "Pacote completo para Paris",
    "destination": "Paris, França",
    "origin": "São Paulo",
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-22",
    "numberOfTravelers": 2,
    "availableSlots": 10,
    "totalMoneyPrice": 8500.00,
    "totalMilesPrice": 850000,
    "images": ["https://example.com/image.jpg"]
  }'
```

### Atualizar Pacote (Agente)
```bash
curl -X PUT http://44.219.93.219:4567/packages/1 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paris Romântico - Atualizado",
    "availableSlots": 8
  }'
```

### Deletar Pacote (Agente)
```bash
curl -X DELETE http://44.219.93.219:4567/packages/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🛒 Compras

### Criar Compra
```bash
curl -X POST http://44.219.93.219:4567/purchases \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": 1,
    "paymentChoice": {
      "useMiles": 50000,
      "useMoney": 4000.00
    }
  }'
```

**Opções de pagamento**:
- 100% dinheiro: `{"useMoney": 8500.00}`
- 100% milhas: `{"useMiles": 850000}`
- Composição: `{"useMiles": 50000, "useMoney": 4000.00}`

### Listar Compras do Usuário
```bash
curl -X GET "http://44.219.93.219:4567/purchases?userId=1" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Filtros disponíveis**:
- `userId`: ID do usuário
- `status`: PENDING, CONFIRMED, CANCELLED
- `destination`: Destino da viagem
- `from`: Data inicial (YYYY-MM-DD)
- `to`: Data final (YYYY-MM-DD)
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

### Buscar Compra por ID
```bash
curl -X GET http://44.219.93.219:4567/purchases/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Cancelar Compra
```bash
curl -X POST http://44.219.93.219:4567/purchases/1/cancel \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "message": "Compra cancelada e valores reembolsados com sucesso.",
  "data": {
    "refunded": {
      "money": 4000.00,
      "miles": 50000
    }
  }
}
```

---

## 💰 Carteira

### Consultar Saldo
```bash
curl -X GET http://44.219.93.219:4567/wallet/balance \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "balanceCash": 5000.00,
    "balanceMiles": 10000
  }
}
```

### Depositar Dinheiro
```bash
curl -X POST http://44.219.93.219:4567/wallet/add-funds \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00
  }'
```

### Adicionar Milhas (Promoção)
```bash
curl -X POST http://44.219.93.219:4567/wallet/add-miles-promo \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "miles": 5000,
    "description": "Bônus de boas-vindas"
  }'
```

### Extrato de Transações
```bash
curl -X GET http://44.219.93.219:4567/wallet/statement \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "date": "2024-11-30T10:00:00.000Z",
        "type": "DEPOSIT",
        "coinType": "CASH",
        "amount": 1000.00,
        "description": "Depósito inicial",
        "balanceBefore": {
          "cash": 4000.00,
          "miles": 10000
        },
        "balanceAfter": {
          "cash": 5000.00,
          "miles": 10000
        }
      }
    ]
  }
}
```

---

## 📊 Dashboard

### Estatísticas do Usuário
```bash
curl -X GET http://44.219.93.219:4567/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "totalSpentMoney": 15000.00,
    "totalSpentMiles": 250000,
    "totalMilesEarned": 15000,
    "totalPurchases": 5,
    "purchasesByStatus": {
      "pending": 0,
      "confirmed": 4,
      "cancelled": 1
    },
    "recentPurchases": [...]
  }
}
```

---

## 🔧 Componentes de Pacote

### Adicionar Componente ao Pacote
```bash
curl -X POST http://44.219.93.219:4567/packages/1/components \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FLIGHT",
    "name": "Voo São Paulo - Paris",
    "description": "Voo direto ida e volta",
    "moneyPrice": 3400.00,
    "milesPrice": 340000,
    "origin": "São Paulo",
    "destination": "Paris",
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-22"
  }'
```

**Tipos de componentes**:
- `FLIGHT`: Voo
- `HOTEL`: Hotel
- `ACTIVITY`: Atividade/Passeio
- `CAR_RENTAL`: Aluguel de carro

---

## 📝 Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `409`: Conflito (ex: email já existe)
- `500`: Erro interno do servidor

---

## 🔑 Autenticação

Todas as rotas (exceto `/auth/login`, `/auth/register` e `/auth/google/*`) requerem autenticação via Bearer Token:

```bash
-H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

O token expira em 15 minutos. Use o endpoint `/auth/refresh` com o refresh token para obter um novo access token.

---

## 💡 Exemplos de Fluxo Completo

### Fluxo de Compra
```bash
# 1. Login
TOKEN=$(curl -X POST http://44.219.93.219:4567/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}' \
  | jq -r '.data.token.accessToken')

# 2. Listar pacotes
curl -X GET http://44.219.93.219:4567/packages \
  -H "Authorization: Bearer $TOKEN"

# 3. Ver detalhes do pacote
curl -X GET http://44.219.93.219:4567/packages/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Verificar saldo
curl -X GET http://44.219.93.219:4567/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 5. Realizar compra
curl -X POST http://44.219.93.219:4567/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId":1,"paymentChoice":{"useMoney":8500.00}}'

# 6. Ver histórico
curl -X GET "http://44.219.93.219:4567/purchases?userId=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ Ambiente de Desenvolvimento

Para rodar localmente:

```bash
# Backend
cd VendasViagens/backend
npm install
npm start

# Frontend
cd VendasViagens/frontend
npm install
npm start
```

**Variáveis de Ambiente** (`.env`):
```
PORT=4567
NODE_ENV=development
JWT_PRIVATE_KEY=sua_chave_secreta
JWT_REFRESH_KEY=sua_chave_refresh
GOOGLE_ID=seu_google_client_id
GOOGLE_SECRET=seu_google_secret
GOOGLE_REDIRECT_URI=minhaapp://auth
```
