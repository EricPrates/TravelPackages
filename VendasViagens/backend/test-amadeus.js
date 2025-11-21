import dotenv from 'dotenv';
import { amadeusClient } from './services/amadeusServices/AmadeusClient.Service.js';

dotenv.config();

async function testAmadeus() {
    console.log('🧪 Testando AmadeusClient...\n');
    
    try {
        // Teste 1: Obter token
        console.log('1️⃣ Testando autenticação...');
        const token = await amadeusClient.getAccessToken();
        console.log(`✅ Token obtido: ${token.substring(0, 20)}...\n`);

        // Teste 2: Buscar voos
        console.log('2️⃣ Testando busca de voos...');
        const flights = await amadeusClient.searchFlights({
            origin: 'GRU',
            destination: 'GIG',
            departureDate: '2025-12-15',
            returnDate: '2025-12-20',
            numberOfTravelers: 1
        });
        console.log(`✅ ${flights.length} voos encontrados\n`);

        // Teste 3: Buscar hotéis
        console.log('3️⃣ Testando busca de hotéis...');
        const hotels = await amadeusClient.searchHotels({
            destination: 'PAR', // Paris - código válido
            checkin: '2025-12-15',
            checkout: '2025-12-20',
            numberOfTravelers: 1
        });
        console.log(`✅ ${hotels.length} hotéis encontrados\n`);

        // Teste 4: Buscar atividades
        console.log('4️⃣ Testando busca de atividades...');
        const activities = await amadeusClient.searchActivities({
            destination: 'PAR' // Agora busca coordenadas automaticamente
        });
        console.log(`✅ ${activities.length} atividades encontradas\n`);

        // Teste 5: Buscar coordenadas de uma cidade
        console.log('5️⃣ Testando busca de coordenadas...');
        const coords = await amadeusClient.getCityCoordinates('NYC');
        console.log(`✅ Nova York: ${coords.cityName} (${coords.latitude}, ${coords.longitude})\n`);

        console.log('🎉 Todos os testes passaram!');

    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAmadeus();
