import dotenv from 'dotenv';
import db from './models/index.js';
import { travelDataService } from './services/TravelData.Service.js';

dotenv.config();

const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

async function testAgentFlow() {
    console.log('🎯 SIMULAÇÃO DO FLUXO DO AGENTE\n');
    console.log('='.repeat(70));
    
    try {
        // Conectar ao banco
        await db.sequelize.sync();
        console.log('✅ Conectado ao banco de dados\n');

        // PASSO 1: Agente cria um pacote base
        console.log('📝 PASSO 1: Agente cria pacote base');
        console.log('-'.repeat(70));
        
        const packageData = {
            title: 'Pacote Rio de Janeiro - Fim de Ano',
            origin: 'GRU',
            destination: 'GIG',
            departureDate: new Date('2025-12-28'),
            returnDate: new Date('2026-01-02'),
            description: 'Pacote completo para passar o Réveillon no Rio',
            availableSlots: 10,
            agentId: 1, // ID do agente
            numberOfTravelers: 2
        };

        const travelPackage = await TravelPackage.create(packageData);
        console.log(`✅ Pacote criado com ID: ${travelPackage.id}`);
        console.log(`   Título: ${travelPackage.title}`);
        console.log(`   Origem: ${travelPackage.origin} → Destino: ${travelPackage.destination}`);
        console.log(`   Período: ${travelPackage.departureDate} a ${travelPackage.returnDate}\n`);

        // PASSO 2: Sistema busca todas as opções disponíveis
        console.log('🔍 PASSO 2: Sistema busca opções disponíveis');
        console.log('-'.repeat(70));
        
        // Formatar datas para YYYY-MM-DD
        const formatDate = (date) => {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        };
        
        const options = await travelDataService.searchAllOptions({
            origin: travelPackage.origin,
            destination: travelPackage.destination,
            departureDate: formatDate(travelPackage.departureDate),
            returnDate: formatDate(travelPackage.returnDate),
            checkin: formatDate(travelPackage.departureDate),
            checkout: formatDate(travelPackage.returnDate),
            numberOfTravelers: travelPackage.numberOfTravelers
        });

        console.log('\n📊 OPÇÕES ENCONTRADAS:');
        console.log(`   ✈️  ${options.summary.totalFlights} voos`);
        console.log(`   🏨 ${options.summary.totalHotels} hotéis`);
        console.log(`   🎯 ${options.summary.totalActivities} atividades`);
        console.log(`   🚗 ${options.summary.totalCars} carros\n`);

        // PASSO 3: Agente visualiza as opções
        console.log('👀 PASSO 3: Agente visualiza as opções');
        console.log('-'.repeat(70));
        
        if (options.flights.length > 0) {
            console.log('\n✈️  VOOS DISPONÍVEIS (Top 3):');
            options.flights.slice(0, 3).forEach((flight, i) => {
                console.log(`   ${i + 1}. R$ ${flight.moneyPrice.toFixed(2)} ou ${flight.milesPrice.toLocaleString()} milhas`);
            });
        }

        if (options.hotels.length > 0) {
            console.log('\n🏨 HOTÉIS DISPONÍVEIS (Top 3):');
            options.hotels.slice(0, 3).forEach((hotel, i) => {
                console.log(`   ${i + 1}. ${hotel.hotel.name} - ⭐ ${hotel.hotel.rating}`);
                console.log(`      R$ ${hotel.moneyPrice.toFixed(2)} ou ${hotel.milesPrice.toLocaleString()} milhas`);
            });
        }

        if (options.activities.length > 0) {
            console.log('\n🎯 ATIVIDADES DISPONÍVEIS (Top 5):');
            options.activities.slice(0, 5).forEach((activity, i) => {
                console.log(`   ${i + 1}. ${activity.name}`);
                console.log(`      R$ ${activity.moneyPrice.toFixed(2)} ou ${activity.milesPrice.toLocaleString()} milhas`);
            });
        }

        if (options.cars.length > 0) {
            console.log('\n🚗 CARROS DISPONÍVEIS (Top 3):');
            options.cars.slice(0, 3).forEach((car, i) => {
                console.log(`   ${i + 1}. ${car.vehicle.name} (${car.vehicle.category})`);
                console.log(`      R$ ${car.moneyPrice.toFixed(2)} ou ${car.milesPrice.toLocaleString()} milhas`);
            });
        }

        // PASSO 4: Agente seleciona e adiciona componentes
        console.log('\n\n✅ PASSO 4: Agente seleciona componentes');
        console.log('-'.repeat(70));
        
        const selectedComponents = [];

        // Adicionar voo mais barato
        if (options.flights.length > 0) {
            const cheapestFlight = options.flights.sort((a, b) => a.moneyPrice - b.moneyPrice)[0];
            const flightComponent = await PackageComponents.create({
                title: 'Voo Selecionado',
                componentName: 'Voo GRU-GIG',
                type: 'FLIGHT',
                moneyPrice: cheapestFlight.moneyPrice,
                milesPrice: cheapestFlight.milesPrice,
                packageId: travelPackage.id,
                origin: travelPackage.origin,
                destination: travelPackage.destination,
                departureDate: travelPackage.departureDate,
                returnDate: travelPackage.returnDate,
                numberOfTravelers: travelPackage.numberOfTravelers,
                AmadeusId: cheapestFlight.id
            });
            selectedComponents.push(flightComponent);
            console.log(`✅ Voo adicionado: R$ ${flightComponent.moneyPrice.toFixed(2)}`);
        }

        // Adicionar hotel mais barato
        if (options.hotels.length > 0) {
            const cheapestHotel = options.hotels.sort((a, b) => a.moneyPrice - b.moneyPrice)[0];
            const hotelComponent = await PackageComponents.create({
                title: `Hotel: ${cheapestHotel.hotel.name}`,
                componentName: cheapestHotel.hotel.name,
                type: 'HOTEL',
                moneyPrice: cheapestHotel.moneyPrice,
                milesPrice: cheapestHotel.milesPrice,
                packageId: travelPackage.id,
                checkinDate: travelPackage.departureDate,
                checkoutDate: travelPackage.returnDate,
                AmadeusId: cheapestHotel.hotel.hotelId
            });
            selectedComponents.push(hotelComponent);
            console.log(`✅ Hotel adicionado: ${hotelComponent.componentName} - R$ ${hotelComponent.moneyPrice.toFixed(2)}`);
        }

        // Adicionar 2 atividades
        if (options.activities.length >= 2) {
            for (let i = 0; i < 2; i++) {
                const activity = options.activities[i];
                const activityComponent = await PackageComponents.create({
                    title: `Atividade: ${activity.name}`,
                    componentName: activity.name,
                    type: 'ACTIVITY',
                    moneyPrice: activity.moneyPrice,
                    milesPrice: activity.milesPrice,
                    packageId: travelPackage.id,
                    AmadeusId: activity.id
                });
                selectedComponents.push(activityComponent);
                console.log(`✅ Atividade adicionada: ${activityComponent.componentName} - R$ ${activityComponent.moneyPrice.toFixed(2)}`);
            }
        }

        // Adicionar carro mais barato
        if (options.cars.length > 0) {
            const cheapestCar = options.cars.sort((a, b) => a.moneyPrice - b.moneyPrice)[0];
            const carComponent = await PackageComponents.create({
                title: `Carro: ${cheapestCar.vehicle.name}`,
                componentName: cheapestCar.vehicle.name,
                type: 'CAR_RENTAL',
                moneyPrice: cheapestCar.moneyPrice,
                milesPrice: cheapestCar.milesPrice,
                packageId: travelPackage.id,
                departureDate: travelPackage.departureDate,
                returnDate: travelPackage.returnDate,
                AmadeusId: cheapestCar.id
            });
            selectedComponents.push(carComponent);
            console.log(`✅ Carro adicionado: ${carComponent.componentName} - R$ ${carComponent.moneyPrice.toFixed(2)}`);
        }

        // PASSO 5: Calcular totais
        console.log('\n\n💰 PASSO 5: Resumo do Pacote Completo');
        console.log('='.repeat(70));
        
        const totalMoney = selectedComponents.reduce((sum, comp) => sum + (comp.moneyPrice || 0), 0);
        const totalMiles = selectedComponents.reduce((sum, comp) => sum + (comp.milesPrice || 0), 0);

        console.log(`\n📦 Pacote: ${travelPackage.title}`);
        console.log(`📍 Destino: ${travelPackage.destination}`);
        console.log(`📅 Período: ${travelPackage.departureDate} a ${travelPackage.returnDate}`);
        console.log(`👥 Viajantes: ${travelPackage.numberOfTravelers} pessoas`);
        console.log(`\n🎁 Componentes inclusos:`);
        selectedComponents.forEach((comp, i) => {
            console.log(`   ${i + 1}. ${comp.title}`);
        });
        console.log(`\n💵 VALOR TOTAL: R$ ${totalMoney.toFixed(2)}`);
        console.log(`✨ OU EM MILHAS: ${totalMiles.toLocaleString()} milhas`);
        console.log('\n' + '='.repeat(70));
        console.log('🎉 Pacote completo criado com sucesso!\n');

        // Limpar dados de teste
        console.log('🧹 Limpando dados de teste...');
        await PackageComponents.destroy({ where: { packageId: travelPackage.id } });
        await TravelPackage.destroy({ where: { id: travelPackage.id } });
        console.log('✅ Dados de teste removidos\n');

    } catch (error) {
        console.error('❌ Erro no fluxo:', error.message);
        console.error(error.stack);
    } finally {
        await db.sequelize.close();
    }
}

testAgentFlow();
