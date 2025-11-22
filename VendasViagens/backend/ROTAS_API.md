# 📡 Documentação das Rotas da API

## 🔐 Autenticação

### **POST /auth/login**
Login de usuário

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "role": "agent",
      "name": "Nome"
    },
    "token": "eyJhbGc...",
    "token_type": "Bearer"
  }
}
```

---

## 👥 Usuários

### **POST /users/register**
Registrar novo usuário (público)

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "customer"
}
```

### **GET /users** 🔒
Listar todos os usuários (requer autenticação)

**Headers:**
```
Authorization: Bearer {token}
```

### **GET /users/:id** 🔒
Buscar usuário por ID

### **GET /users/search?name=João** 🔒
Buscar usuário por nome (query parameter)

### **PUT /users/:id** 🔒
Atualizar usuário

### **DELETE /users/:id** 🔒
Deletar usuário

---

## 💰 Carteira

### **POST /wallet/add-funds** 🔒
Adicionar dinheiro

**Body:**
```json
{
  "userId": 1,
  "amount": 100.00
}
```

### **POST /wallet/redeem-miles** 🔒
Adicionar milhas

**Body:**
```json
{
  "userId": 1,
  "amount": 10000
}
```

### **GET /wallet/balance/:userId** 🔒
Ver saldo do usuário

**Response:**
```json
{
  "balanceInCash": 500.00,
  "balanceInMiles": 50000
}
```

### **GET /wallet/statements/:userId** 🔒
Ver extrato do usuário

---

## ✈️ Pacotes de Viagem

### **POST /travel-packages** 🔒👮
Criar pacote base (requer ser agente)

**Body:**
```json
{
  "title": "Pacote Rio de Janeiro",
  "origin": "GRU",
  "destination": "GIG",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "description": "Pacote completo",
  "availableSlots": 10,
  "numberOfTravelers": 2
}
```

**Response:**
```json
{
  "success": true,
  "package": {
    "id": 1,
    "title": "Pacote Rio de Janeiro",
    "origin": "GRU",
    "destination": "GIG",
    ...
  }
}
```

### **GET /travel-packages/:id/options** 🔒👮
Buscar opções disponíveis para o pacote

**Query Params (opcional):**
- `type`: FLIGHT | HOTEL | ACTIVITY | CAR_RENTAL

**Exemplos:**
```
GET /travel-packages/1/options           // Todas as opções
GET /travel-packages/1/options?type=FLIGHT  // Apenas voos
```

**Response:**
```json
{
  "success": true,
  "options": {
    "flights": [...],      // 10 voos
    "hotels": [...],       // 5-8 hotéis
    "activities": [...],   // Atividades
    "carRentals": [...]    // 6 carros
  },
  "summary": {
    "totalFlights": 10,
    "totalHotels": 7,
    "totalActivities": 95,
    "totalCars": 6
  }
}
```

### **POST /travel-packages/:id/components** 🔒👮
Adicionar um componente ao pacote

**Body:**
```json
{
  "type": "FLIGHT",
  "component": {
    "id": "flight_123",
    "name": "Voo LATAM",
    "moneyPrice": 1500.00,
    "milesPrice": 135000,
    "origin": "GRU",
    "destination": "GIG",
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-20"
  }
}
```

### **POST /travel-packages/:id/components/batch** 🔒👮
Adicionar múltiplos componentes de uma vez

**Body:**
```json
{
  "selectedFlight": {...},
  "selectedHotel": {...},
  "selectedActivities": [{...}, {...}],
  "selectedCarRental": {...}
}
```

### **GET /travel-packages**
Listar todos os pacotes (público)

### **GET /travel-packages/:id**
Buscar pacote por ID (público)

### **PUT /travel-packages/:id** 🔒👮
Atualizar pacote

### **DELETE /travel-packages/:id** 🔒👮
Deletar pacote

---

## 🎯 Componentes de Pacote

### **POST /package-components** 🔒👮
Criar componente

### **PUT /package-components/:id** 🔒👮
Atualizar componente

### **DELETE /package-components/:id** 🔒👮
Deletar componente

---

## 🔑 Legendas

- 🔒 = Requer autenticação (token)
- 👮 = Requer ser agente (role: 'agent')

---

## ⚠️ Limitações Conhecidas

### **Resposta muito grande (>2MB)**

Se você receber erro "Response is more than 2MB", significa que a rota está retornando muitos dados.

**Rotas afetadas:**
- `GET /travel-packages/:id/options` - Pode retornar 95+ atividades

**Soluções:**

1. **Usar filtro por tipo:**
```
GET /travel-packages/1/options?type=FLIGHT  // Apenas voos
```

2. **Adicionar paginação** (recomendado para produção)

3. **Limitar resultados no backend**

---

## 🧪 Exemplos de Teste (Thunder Client)

### **1. Login:**
```
POST http://localhost:4567/auth/login
Content-Type: application/json

{
  "email": "agente@email.com",
  "password": "senha123"
}
```

### **2. Criar Pacote:**
```
POST http://localhost:4567/travel-packages
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "title": "Pacote Rio",
  "origin": "GRU",
  "destination": "GIG",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "description": "Pacote teste",
  "availableSlots": 10,
  "numberOfTravelers": 2
}
```

### **3. Buscar Apenas Voos:**
```
GET http://localhost:4567/travel-packages/1/options?type=FLIGHT
Authorization: Bearer {seu_token}
```

### **4. Buscar Apenas Hotéis:**
```
GET http://localhost:4567/travel-packages/1/options?type=HOTEL
Authorization: Bearer {seu_token}
```

---

## 💡 Dicas

1. **Sempre use o filtro `type`** ao buscar opções para evitar respostas grandes
2. **Salve o token** após o login para usar nas outras requisições
3. **Use códigos IATA válidos**: GRU, GIG, SAO, RIO, PAR, NYC, etc.
4. **Datas no formato**: YYYY-MM-DD
5. **Role do usuário**: 'agent' para criar pacotes, 'customer' para reservar
