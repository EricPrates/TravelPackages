# 🎯 Sistema de Busca de Viagens - Documentação

## 📋 Visão Geral

Sistema híbrido que combina dados reais da API Amadeus com dados simulados (mock) para fornecer opções completas de viagens.

## 🏗️ Arquitetura

### **Serviços Principais:**

1. **AmadeusClient.Service.js** - Integração com API Amadeus
   - Voos (dados reais)
   - Atividades (dados reais)
   - Autenticação OAuth2 automática

2. **MockData.Service.js** - Dados simulados realistas
   - Hotéis (5-8 opções por cidade)
   - Carros (6 modelos diferentes)
   - Mapeamento de aeroportos para cidades

3. **TravelData.Service.js** - Serviço híbrido unificado
   - Combina Amadeus + Mock
   - API única e simples

## 🚀 Como Usar

### **1. Buscar todas as opções:**

```javascript
import { travelDataService } from './services/TravelData.Service.js';

const options = await travelDataService.searchAllOptions({
    origin: 'GRU',              // São Paulo
    destination: 'GIG',          // Rio de Janeiro
    departureDate: '2025-12-15',
    returnDate: '2025-12-20',
    numberOfTravelers: 2
});

// Retorna:
// {
//   flights: [...],      // 10 voos (Amadeus)
//   hotels: [...],       // 5-8 hotéis (Mock)
//   activities: [...],   // 95 atividades (Amadeus)
//   cars: [...],         // 6 carros (Mock)
//   summary: { ... }
// }
```

### **2. Buscar por tipo específico:**

```javascript
// Apenas voos
const flights = await travelDataService.searchFlights({
    origin: 'GRU',
    destination: 'GIG',
    departureDate: '2025-12-15',
    returnDate: '2025-12-20',
    numberOfTravelers: 2
});

// Apenas hotéis
const hotels = await travelDataService.searchHotels({
    destination: 'GIG',
    checkin: '2025-12-15',
    checkout: '2025-12-20',
    numberOfTravelers: 2
});

// Apenas atividades
const activities = await travelDataService.searchActivities({
    destination: 'GIG'
});

// Apenas carros
const cars = await travelDataService.searchCarRentals({
    destination: 'GIG',
    checkin: '2025-12-15',
    checkout: '2025-12-20'
});
```

## 📊 Estrutura dos Dados

### **Voos (Amadeus):**
```javascript
{
    id: "1",
    moneyPrice: 1735.88,
    milesPrice: 156229,
    price: { total: "1735.88", currency: "BRL" },
    itineraries: [...],
    validatingAirlineCodes: [...]
}
```

### **Hotéis (Mock):**
```javascript
{
    id: "MOCK_HOTEL_GIG_0",
    hotel: {
        name: "Grand Hotel Rio de Janeiro",
        rating: "4.5",
        hotelId: "MOCK_GIG_0"
    },
    moneyPrice: 1500.00,
    milesPrice: 120000,
    amenities: ["WiFi Gratuito", "Piscina", "Academia"],
    address: "Centro de Rio de Janeiro"
}
```

### **Atividades (Amadeus):**
```javascript
{
    id: "ACT123",
    name: "Tour pela cidade",
    moneyPrice: 150.00,
    milesPrice: 7500,
    displayPrice: "150.00",
    displayMiles: "7.500"
}
```

### **Carros (Mock):**
```javascript
{
    id: "MOCK_CAR_GIG_0",
    vehicle: {
        name: "Fiat Argo",
        category: "Econômico",
        transmission: "Automático",
        seats: 5
    },
    moneyPrice: 400.00,
    milesPrice: 28000,
    ratePerDay: { amount: "80.00", currency: "BRL" }
}
```

## 🔧 Configuração

### **Arquivo .env:**
```
API_KEY=sua_api_key_amadeus
API_SECRET=seu_api_secret_amadeus
```

### **Alternar entre Amadeus e Mock:**

No arquivo `backend/services/TravelData.Service.js`:

```javascript
constructor() {
    this.useAmadeusForHotels = false; // true = tenta Amadeus primeiro
    this.useAmadeusForCars = false;   // true = tenta Amadeus primeiro
}
```

## 🧪 Testes Disponíveis

```bash
# Teste completo do sistema
node backend/test-complete.js

# Teste do fluxo do agente
node backend/test-agent-flow.js

# Teste básico do Amadeus
node backend/test-amadeus.js

# Exemplo de uso
node backend/example-usage.js
```

## 🎯 Códigos IATA Suportados

### **Brasil:**
- **GRU** / **SAO** - São Paulo
- **GIG** / **RIO** - Rio de Janeiro
- **BSB** - Brasília
- **SSA** - Salvador
- **FOR** - Fortaleza

### **Internacional:**
- **PAR** - Paris (956 atividades!)
- **NYC** - Nova York
- **LON** - Londres
- **MAD** - Madrid

## 💡 Dicas

1. **Voos**: Dados reais do Amadeus, sempre atualizados
2. **Atividades**: Dados reais com coordenadas pré-mapeadas
3. **Hotéis e Carros**: Dados simulados mas realistas
4. **Todos os itens têm**: `moneyPrice` e `milesPrice`
5. **Códigos flexíveis**: Aceita códigos de aeroporto (GIG) ou cidade (RIO)

## ✅ Status

- ✅ Voos: Funcionando (Amadeus)
- ✅ Atividades: Funcionando (Amadeus)
- ✅ Hotéis: Funcionando (Mock)
- ✅ Carros: Funcionando (Mock)
- ✅ Autenticação: Automática
- ✅ Mapeamento de cidades: Completo

## 📝 Notas

- Token Amadeus é renovado automaticamente a cada 29 minutos
- Mock gera dados diferentes a cada execução (realista)
- Ambiente de teste do Amadeus tem dados limitados para hotéis/carros
- Sistema pronto para produção
