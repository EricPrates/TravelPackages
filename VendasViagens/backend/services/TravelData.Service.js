import { amadeusClient } from './amadeusServices/AmadeusClient.Service.js';
import { mockDataService } from './mockServices/MockData.Service.js';
import dotenv from 'dotenv';
dotenv.config();


export class TravelDataService {
    constructor() {
        this.useAmadeusForHotels = false; 
        this.useAmadeusForCars = false;  
    }

   
    async searchFlights(params) {
        try {
            const flights = await amadeusClient.searchFlights(params);
            if (flights && flights.length > 0) {
                return flights;
            }
            console.log('⚠️ Amadeus retornou 0 voos, usando Mock');
            return mockDataService.searchFlights(params);
        } catch (error) {
            console.log('❌ Erro na Amadeus, usando Mock:', error.message);
            return mockDataService.searchFlights(params);
        }
    }

   
    async searchActivities(params) {
        try {
            const activities = await amadeusClient.searchActivities(params);
            return activities && activities.length > 0 ? activities : [];
        } catch (error) {
            console.error('Erro ao buscar atividades:', error.message);
            return [];
        }
    }

    
    async searchHotels(params) {
        if (this.useAmadeusForHotels) {
            try {
                const hotels = await amadeusClient.searchHotels(params);
                if (hotels && hotels.length > 0) {
                    return hotels;
                }
            } catch (error) {
            
            }
        }
        
        return mockDataService.searchHotels(params);
    }

    async searchCarRentals(params) {
        if (this.useAmadeusForCars) {
            try {
                const cars = await amadeusClient.searchCarRentals(params);
                if (cars && cars.length > 0) {
                    return cars;
                }
            } catch (error) {
             
            }
        }
        
        return mockDataService.searchCarRentals(params);
    }

   
    async getCityCoordinates(cityCode) {
        return await amadeusClient.getCityCoordinates(cityCode);
    }


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

  
    getCityName(cityCode) {
        return mockDataService.getCityName(cityCode);
    }
}

export const travelDataService = new TravelDataService();
