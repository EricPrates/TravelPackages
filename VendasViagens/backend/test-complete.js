import dotenv from 'dotenv';
import { travelDataService } from './services/TravelData.Service.js';

dotenv.config();

async function testCompletePackage() {
    console.log('🎒 TESTE COMPLETO - Pacote de Viagem\n');
    console.log('='.repeat(60));
    console.log('Destino: São Paulo → Rio de Janeiro');
    console.log('Período: 15/12/2025 a 20/12/2025');
    console.log('Viajantes: 2 pessoas');
    console.log('='.repeat(60) + '\n');

    try {
        const packageData = await travelDataService.searchAllOptions({
            origin: 'GRU',
            destination: 'GIG',
            departureDate: '2025-12-15',
            returnDate: '2025-12-20',
            checkin: '2025-12-15',
            checkout: '2025-12-20',
            numberOfTravelers: 2
        });

        // Resumo
        console.log('📊 RESUMO DA BUSCA:');
        console.log('='.repeat(60));
        console.log(`✈️  Voos encontrados: ${packageData.summary.totalFlights}`);
        console.log(`🏨 Hotéis encontrados: ${packageData.summary.totalHotels}`);
        console.log(`🎯 Atividades encontradas: ${packageData.summary.totalActivities}`);
        console.log(`🚗 Carros disponíveis: ${packageData.summary.totalCars}`);
        console.log('='.repeat(60) + '\n');

        // Detalhes dos voos
        if (packageData.flights.length > 0) {
            console.log('✈️  VOOS DISPONÍVEIS (Top 3):');
            console.log('-'.repeat(60));
            packageData.flights.slice(0, 3).forEach((flight, index) => {
                console.log(`${index + 1}. Voo ${flight.id}`);
                console.log(`   💰 Preço: R$ ${flight.moneyPrice.toFixed(2)}`);
                console.log(`   ✨ Milhas: ${flight.milesPrice.toLocaleString()}`);
                console.log('');
            });
        }

        // Detalhes dos hotéis
        if (packageData.hotels.length > 0) {
            console.log('🏨 HOTÉIS DISPONÍVEIS (Top 3):');
            console.log('-'.repeat(60));
            packageData.hotels.slice(0, 3).forEach((hotel, index) => {
                console.log(`${index + 1}. ${hotel.hotel.name}`);
                console.log(`   ⭐ Avaliação: ${hotel.hotel.rating}`);
                console.log(`   💰 Preço: R$ ${hotel.moneyPrice.toFixed(2)}`);
                console.log(`   ✨ Milhas: ${hotel.milesPrice.toLocaleString()}`);
                console.log(`   📍 ${hotel.address}`);
                console.log(`   🎁 Comodidades: ${hotel.amenities.slice(0, 3).join(', ')}`);
                console.log('');
            });
        }

        // Detalhes das atividades
        if (packageData.activities.length > 0) {
            console.log('🎯 ATIVIDADES DISPONÍVEIS (Top 5):');
            console.log('-'.repeat(60));
            packageData.activities.slice(0, 5).forEach((activity, index) => {
                console.log(`${index + 1}. ${activity.name}`);
                console.log(`   💰 Preço: R$ ${activity.moneyPrice.toFixed(2)}`);
                console.log(`   ✨ Milhas: ${activity.milesPrice.toLocaleString()}`);
                console.log('');
            });
        }

        // Detalhes dos carros
        if (packageData.cars.length > 0) {
            console.log('🚗 CARROS DISPONÍVEIS:');
            console.log('-'.repeat(60));
            packageData.cars.forEach((car, index) => {
                console.log(`${index + 1}. ${car.vehicle.name} (${car.vehicle.category})`);
                console.log(`   🔧 ${car.vehicle.transmission} | ${car.vehicle.seats} lugares`);
                console.log(`   💰 Preço total: R$ ${car.moneyPrice.toFixed(2)}`);
                console.log(`   💵 Diária: R$ ${car.ratePerDay.amount}`);
                console.log(`   ✨ Milhas: ${car.milesPrice.toLocaleString()}`);
                console.log('');
            });
        }

        // Calcular pacote completo
        console.log('💎 PACOTE COMPLETO (Opções mais baratas):');
        console.log('='.repeat(60));
        
        const cheapestFlight = packageData.flights[0];
        const cheapestHotel = packageData.hotels.sort((a, b) => a.moneyPrice - b.moneyPrice)[0];
        const cheapestCar = packageData.cars.sort((a, b) => a.moneyPrice - b.moneyPrice)[0];
        const activity1 = packageData.activities[0];
        const activity2 = packageData.activities[1];

        const totalMoney = 
            (cheapestFlight?.moneyPrice || 0) +
            (cheapestHotel?.moneyPrice || 0) +
            (cheapestCar?.moneyPrice || 0) +
            (activity1?.moneyPrice || 0) +
            (activity2?.moneyPrice || 0);

        const totalMiles = 
            (cheapestFlight?.milesPrice || 0) +
            (cheapestHotel?.milesPrice || 0) +
            (cheapestCar?.milesPrice || 0) +
            (activity1?.milesPrice || 0) +
            (activity2?.milesPrice || 0);

        console.log('Incluindo:');
        console.log(`  ✈️  Voo ida e volta`);
        console.log(`  🏨 Hotel (5 noites)`);
        console.log(`  🚗 Carro alugado (5 dias)`);
        console.log(`  🎯 2 atividades`);
        console.log('');
        console.log(`💰 TOTAL EM DINHEIRO: R$ ${totalMoney.toFixed(2)}`);
        console.log(`✨ TOTAL EM MILHAS: ${totalMiles.toLocaleString()} milhas`);
        console.log('='.repeat(60));

        console.log('\n🎉 Teste completo finalizado com sucesso!\n');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error(error.stack);
    }
}

// Teste rápido de múltiplos destinos
async function testMultipleDestinations() {
    console.log('\n🌍 TESTE - Comparação de Destinos\n');
    console.log('='.repeat(60));

    const destinations = [
        { code: 'GIG', name: 'Rio de Janeiro' },
        { code: 'PAR', name: 'Paris' }
    ];

    for (const dest of destinations) {
        console.log(`\n📍 ${dest.name.toUpperCase()}`);
        console.log('-'.repeat(60));

        const hotels = await travelDataService.searchHotels({
            destination: dest.code,
            checkin: '2025-12-15',
            checkout: '2025-12-20',
            numberOfTravelers: 2
        });

        if (hotels.length > 0) {
            const avgPrice = hotels.reduce((sum, h) => sum + h.moneyPrice, 0) / hotels.length;
            const cheapest = Math.min(...hotels.map(h => h.moneyPrice));
            const expensive = Math.max(...hotels.map(h => h.moneyPrice));

            console.log(`🏨 ${hotels.length} hotéis disponíveis`);
            console.log(`💰 Preço médio: R$ ${avgPrice.toFixed(2)}`);
            console.log(`📉 Mais barato: R$ ${cheapest.toFixed(2)}`);
            console.log(`📈 Mais caro: R$ ${expensive.toFixed(2)}`);
        }
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Executar testes
async function main() {
    await testCompletePackage();
    await testMultipleDestinations();
}

main();
