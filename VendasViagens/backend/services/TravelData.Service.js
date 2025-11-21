import { amadeusClient } from './amadeusServices/AmadeusClient.Service.js';
import { mockDataService } from './mockServices/MockData.Service.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Serviço híbrido que usa:
 * - Amadeus para voos e atividades (funcionando bem)
 * - Mock para hotéis e carros (dados limitados no Amadeus test)
 */
export class TravelDataService {
    constructor() {
        this.useAmadeusForHotels = false; // Mude para true se quiser tentar Amadeus
        this.useAmadeusForCars = false;   // Mude para true se quiser tentar Amadeus
    }

    /**
     * Buscar voos - USA AMADEUS (dados reais)
     */
    async searchFlights(params) {
        return await amadeusClient.searchFlights(params);
    }

    /**
     * Buscar atividades - USA AMADEUS com coordenadas do mock
     * Usa coordenadas pré-mapeadas para garantir resultados
     */
    async searchActivities(params) {
        // Usa coordenadas do mock para garantir resultados
        const coords = mockDataService.getCityCoordinates(params.destination);
        
        if (coords) {
            try {
                const activities = await amadeusClient.searchActivities({
                    ...params,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                });
                
                if (activities && activities.length > 0) {
                    return activities;
                }
            } catch (error) {
                // Silencioso - retorna array vazio
            }
        }
        
        // Tenta buscar direto no Amadeus se não tem coordenadas
        try {
            const activities = await amadeusClient.searchActivities(params);
            return activities && activities.length > 0 ? activities : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Buscar hotéis - USA MOCK (dados simulados realistas)
     * Pode tentar Amadeus primeiro se useAmadeusForHotels = true
     */
    async searchHotels(params) {
        if (this.useAmadeusForHotels) {
            try {
                const hotels = await amadeusClient.searchHotels(params);
                if (hotels && hotels.length > 0) {
                    return hotels;
                }
            } catch (error) {
                // Fallback para mock
            }
        }
        
        return mockDataService.searchHotels(params);
    }

    /**
     * Buscar aluguel de carros - USA MOCK (dados simulados realistas)
     * Pode tentar Amadeus primeiro se useAmadeusForCars = true
     */
    async searchCarRentals(params) {
        if (this.useAmadeusForCars) {
            try {
                const cars = await amadeusClient.searchCarRentals(params);
                if (cars && cars.length > 0) {
                    return cars;
                }
            } catch (error) {
                // Fallback para mock
            }
        }
        
        return mockDataService.searchCarRentals(params);
    }

    /**
     * Buscar coordenadas de uma cidade - USA AMADEUS
     */
    async getCityCoordinates(cityCode) {
        return await amadeusClient.getCityCoordinates(cityCode);
    }

    /**
     * Buscar todas as opções de uma vez
     * Retorna voos, hotéis, atividades e carros disponíveis
     */
    async searchAllOptions(params) {
        const { origin, destination, departureDate, returnDate, checkin, checkout, numberOfTravelers } = params;

        const [flights, hotels, activities, cars] = await Promise.all([
            this.searchFlights({
                origin,
                destination,
                departureDate,
                returnDate,
                numberOfTravelers
            }),
            this.searchHotels({
                destination,
                checkin: checkin || departureDate,
                checkout: checkout || returnDate,
                numberOfTravelers
            }),
            this.searchActivities({
                destination
            }),
            this.searchCarRentals({
                destination,
                checkin: checkin || departureDate,
                checkout: checkout || returnDate
            })
        ]);

        return {
            flights,
            hotels,
            activities,
            cars,
            summary: {
                totalFlights: flights.length,
                totalHotels: hotels.length,
                totalActivities: activities.length,
                totalCars: cars.length
            }
        };
    }

    /**
     * Obter nome da cidade
     */
    getCityName(cityCode) {
        return mockDataService.getCityName(cityCode);
    }
}

export const travelDataService = new TravelDataService();
