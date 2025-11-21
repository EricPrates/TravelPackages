# 📚 Guia de Uso do AmadeusClient

## ✅ O que está funcionando:

### 1. **Buscar Voos** ✈️
```javascript
import { amadeusClient } from './services/amadeusServices/AmadeusClient.Service.js';

const flights = await amadeusClient.searchFlights({
    origin: 'GRU',              // Código IATA do aeroporto de origem
    destination: 'GIG',          // Código IATA do aeroporto de destino
    departureDate: '2025-12-15', // Formato: YYYY-MM-DD
    returnDate: '2025-12-20',    // Opcional para voos de ida e volta
    numberOfTravelers: 2
});

// Retorna array de voos com moneyPrice e milesPrice
console.log(flights[0].moneyPrice);  // Preço em dinheiro
console.log(flights[0].milesPrice);  // Preço em milhas
```

### 2. **Buscar Atividades** 🎯
```javascript
// Opção 1: Passar apenas o código da cidade (busca coordenadas automaticamente)
const activities = await amadeusClient.searchActivities({
    destination: 'PAR'  // Paris
});

// Opção 2: Passar coordenadas diretamente (mais rápido)
const activities = await amadeusClient.searchActivities({
    destination: 'Paris',
    latitude: 48.85334,
    longitude: 2.34889
});

console.log(`${activities.length} atividades encontradas`);
```

### 3. **Buscar Coordenadas de uma Cidade** 📍
```javascript
const coords = await amadeusClient.getCityCoordinates('NYC');

console.log(coords.cityName);   // "NEW YORK"
console.log(coords.latitude);   // 40.71417
console.log(coords.longitude);  // -74.00583
console.log(coords.iataCode);   // "NYC"
```

### 4. **Buscar Hotéis** 🏨
```javascript
const hotels = await amadeusClient.searchHotels({
    destination: 'PAR',          // Código IATA da cidade
    checkin: '2025-12-15',       // Formato: YYYY-MM-DD
    checkout: '2025-12-20',
    numberOfTravelers: 2
});

// ⚠️ Nota: API de hotéis tem dados limitados no ambiente de teste
```

### 5. **Buscar Aluguel de Carros** 🚗
```javascript
const cars = await amadeusClient.searchCarRentals({
    destination: 'PAR',
    checkin: '2025-12-15',
    checkout: '2025-12-20'
});
```

## 🔑 Códigos IATA Comuns:

### Brasil:
- **GRU** - São Paulo (Guarulhos)
- **GIG** - Rio de Janeiro (Galeão)
- **BSB** - Brasília
- **SSA** - Salvador
- **FOR** - Fortaleza
- **REC** - Recife
- **POA** - Porto Alegre
- **CGH** - São Paulo (Congonhas)

### Internacional:
- **NYC** - Nova York
- **PAR** - Paris
- **LON** - Londres
- **MAD** - Madrid
- **ROM** - Roma
- **BCN** - Barcelona
- **BER** - Berlim
- **TYO** - Tóquio

## 💡 Dicas:

1. **Autenticação automática**: O token é obtido e renovado automaticamente
2. **Tratamento de erros**: Todos os métodos retornam `[]` em caso de erro
3. **Cache de token**: O token é cacheado por 29 minutos
4. **Coordenadas**: Atividades buscam coordenadas automaticamente se não fornecidas

## ⚠️ Limitações do Ambiente de Teste:

- Hotéis podem não retornar resultados para todas as cidades
- Aluguel de carros tem dados limitados
- Alguns códigos IATA podem não ter dados disponíveis

## 🔧 Configuração:

Certifique-se de ter as credenciais no `.env`:
```
API_KEY=sua_api_key_aqui
API_SECRET=seu_api_secret_aqui
```

Obtenha suas credenciais em: https://developers.amadeus.com/my-apps
