# 🎯 Guia Completo - Sistema de Busca de Viagens

## ✅ O que está funcionando:

### **Sistema Híbrido:**
- ✈️ **Voos**: Amadeus API (dados reais)
- 🎯 **Atividades**: Amadeus API (dados reais)
- 🏨 **Hotéis**: Mock Service (dados simulados realistas)
- 🚗 **Carros**: Mock Service (dados simulados realistas)

## 🚀 Como usar no seu projeto:

### **1. Importar o serviço:**

```javascript
import { travelDataService } from './services/TravelData.Service.js';
```

### **2. Buscar um pacote completo:**

```javascript
const packageData = await travelDataService.searchAllOptions({
    origin: 'GRU',              // São Paulo
    destination: 'GIG',          // Rio de Janeiro
    departureDate: '2025-12-15',
    returnDate: '2025-12-20',
    checkin: '2025-12-15',
    checkout: '2025-12-20',
    numberOfTravelers: 2
});

// Retorna:
// {
//   flights: [...],      // 10 voos
//   hotels: [...],       // 5-8 hotéis
//   activities: [...],   // Atividades disponíveis
//   cars: [...],         // 6 opções de carros
//   summary: { ... }     // Resumo das quantidades
// }
```

### **3. Buscar itens individuais:**

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
    destination: 'PAR'  // Paris
});

// Apenas carros
const cars = await travelDataService.searchCarRentals({
    destination: 'GIG',
    checkin: '2025-12-15',
    checkout: '2025-12-20'
});
```

### **4. Estrutura dos dados retornados:**

#### **Voos (Amadeus real):**
```javascript
{
    id: "1",
    moneyPrice: 1735.88,
    milesPrice: 156229,
    price: {
        total: "1735.88",
        currency: "BRL"
    },
    itineraries: [...],
    validatingAirlineCodes: [...]
}
```

#### **Hotéis (Mock):**
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
    address: "Centro de Rio de Janeiro",
    offers: [{
        checkInDate: "2025-12-15",
        checkOutDate: "2025-12-20",
        price: { total: "1500.00", currency: "BRL" }
    }]
}
```

#### **Atividades (Amadeus real):**
```javascript
{
    id: "ACT123",
    name: "Tour pela cidade",
    moneyPrice: 150.00,
    milesPrice: 7500,
    displayPrice: "150.00",
    displayMiles: "7.500",
    price: {
        amount: "150.00",
        currency: "EUR"
    }
}
```

#### **Carros (Mock):**
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
    ratePerDay: { amount: "80.00", currency: "BRL" },
    pickUpDate: "2025-12-15",
    dropOffDate: "2025-12-20"
}
```

## 🔧 Configuração:

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

## 📊 Exemplo de uso no TravelPackage.service.js:

```javascript
import { travelDataService } from '../services/TravelData.Service.js';

export const createdPackageWithOptions = async (req, res) => {
    try {
        const { title, destination, origin, departureDate, returnDate, ... } = req.body;

        // 1. Criar o pacote no banco
        const travelPackage = await TravelPackage.create({
            title,
            destination,
            origin,
            departureDate,
            returnDate,
            ...
        });

        // 2. Buscar opções disponíveis
        const options = await travelDataService.searchAllOptions({
            origin,
            destination,
            departureDate,
            returnDate,
            checkin: req.body.checkin,
            checkout: req.body.checkout,
            numberOfTravelers: req.body.numberOfTravelers || 1
        });

        // 3. Retornar pacote + opções
        res.status(201).json({
            success: true,
            travelPackage: {
                id: travelPackage.id,
                title: travelPackage.title,
                ...
            },
            availableOptions: {
                flights: options.flights,
                hotels: options.hotels,
                activities: options.activities,
                carRentals: options.cars
            },
            summary: options.summary
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
};
```

## 🧪 Testes disponíveis:

```bash
# Teste básico do Amadeus
node backend/test-amadeus.js

# Teste completo (híbrido)
node backend/test-complete.js

# Exemplo de uso
node backend/example-usage.js
```

## 💡 Dicas:

1. **Voos funcionam perfeitamente** com dados reais do Amadeus
2. **Atividades funcionam** mas dependem da cidade (Paris tem 956!)
3. **Hotéis e carros usam mock** - dados realistas mas simulados
4. **Todos os itens têm moneyPrice e milesPrice** para cálculos
5. **Mock gera dados diferentes** a cada execução (realista)

## 🎯 Códigos IATA úteis:

**Brasil:**
- GRU - São Paulo
- GIG - Rio de Janeiro  
- BSB - Brasília
- SSA - Salvador

**Internacional:**
- PAR - Paris (956 atividades!)
- NYC - Nova York
- LON - Londres
- MAD - Madrid

## ✅ Resultado Final:

**Pacote completo São Paulo → Rio (5 dias, 2 pessoas):**
- ✈️ Voo: R$ 1.735,88
- 🏨 Hotel: R$ 1.057,51
- 🚗 Carro: R$ 400,00
- **TOTAL: R$ 3.193,39 ou 268.830 milhas**

🎉 **Sistema pronto para uso!**
