import dotenv from 'dotenv';
import { amadeusClient } from './services/amadeusServices/AmadeusClient.Service.js';

dotenv.config();

// Exemplo: Criar um pacote de viagem completo
async function createTravelPackageExample() {
    console.log('🎒 Criando pacote de viagem: São Paulo → Rio de Janeiro\n');

    try {
        // 1. Buscar voos
        console.log('1️⃣ Buscando voos...');
        const flights = await amadeusClient.searchFlights({
            origin: 'GRU',
            destination: 'GIG',
            departureDate: '2025-12-15',
            returnDate: '2025-12-20',
            numberOfTravelers: 2
        });
        console.log(`✅ ${flights.length} voos encontrados`);
        if (flights.length > 0) {
            console.log(`   Exemplo: R$ ${flights[0].moneyPrice} ou ${flights[0].milesPrice} milhas\n`);
        }

        // 2. Buscar hotéis
        console.log('2️⃣ Buscando hotéis no Rio...');
        const hotels = await amadeusClient.searchHotels({
            destination: 'RIO',
            checkin: '2025-12-15',
            checkout: '2025-12-20',
            numberOfTravelers: 2
        });
        console.log(`✅ ${hotels.length} hotéis encontrados\n`);

        // 3. Buscar atividades
        console.log('3️⃣ Buscando atividades no Rio...');
        const activities = await amadeusClient.searchActivities({
            destination: 'RIO'
        });
        console.log(`✅ ${activities.length} atividades encontradas`);
        if (activities.length > 0) {
            console.log(`   Exemplo: ${activities[0].name}`);
            console.log(`   Preço: R$ ${activities[0].moneyPrice} ou ${activities[0].milesPrice} milhas\n`);
        }

        // 4. Buscar aluguel de carros
        console.log('4️⃣ Buscando aluguel de carros...');
        const cars = await amadeusClient.searchCarRentals({
            destination: 'RIO',
            checkin: '2025-12-15',
            checkout: '2025-12-20'
        });
        console.log(`✅ ${cars.length} carros disponíveis\n`);

        // 5. Calcular preço total do pacote
        const totalMoney = 
            (flights[0]?.moneyPrice || 0) + 
            (hotels[0]?.moneyPrice || 0) + 
            (activities[0]?.moneyPrice || 0) +
            (cars[0]?.moneyPrice || 0);

        const totalMiles = 
            (flights[0]?.milesPrice || 0) + 
            (hotels[0]?.milesPrice || 0) + 
            (activities[0]?.milesPrice || 0) +
            (cars[0]?.milesPrice || 0);

        console.log('💰 Resumo do Pacote:');
        console.log(`   Total em dinheiro: R$ ${totalMoney.toFixed(2)}`);
        console.log(`   Total em milhas: ${totalMiles.toLocaleString()} milhas`);
        console.log('\n✅ Pacote criado com sucesso!');

        return {
            flights,
            hotels,
            activities,
            cars,
            totalMoney,
            totalMiles
        };

    } catch (error) {
        console.error('❌ Erro ao criar pacote:', error.message);
    }
}

// Exemplo: Buscar opções para múltiplos destinos
async function compareDestinations() {
    console.log('🌍 Comparando destinos: Rio vs Paris\n');

    const destinations = [
        { code: 'RIO', name: 'Rio de Janeiro' },
        { code: 'PAR', name: 'Paris' }
    ];

    for (const dest of destinations) {
        console.log(`📍 ${dest.name}:`);
        
        const activities = await amadeusClient.searchActivities({
            destination: dest.code
        });
        
        console.log(`   ${activities.length} atividades disponíveis`);
        
        if (activities.length > 0) {
            const avgPrice = activities.reduce((sum, a) => sum + a.moneyPrice, 0) / activities.length;
            console.log(`   Preço médio: R$ ${avgPrice.toFixed(2)}\n`);
        }
    }
}

// Executar exemplos
async function main() {
    console.log('🚀 Exemplos de uso do AmadeusClient\n');
    console.log('='.repeat(50) + '\n');
    
    await createTravelPackageExample();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    await compareDestinations();
}

main();
