import Amadeus from 'amadeus';
import { parse } from 'dotenv';

export class AmadeusClient{
    constructor(){
        this.amadeus = new Amadeus({
            clientId: process.env.AMADEUS_CLIENT_ID,
            clientSecret: process.env.AMADEUS_CLIENT_SECRET
        });
    }

    calculateMilesPrice(moneyPrice, type) {
        switch(type){
            case 'FLIGHT':
                return Math.round(moneyPrice * 90);
            case 'HOTEL':
                return Math.round(moneyPrice * 80);
            case 'TOUR':
                return Math.round(moneyPrice * 50);
            default:
                return Math.round(moneyPrice * 100);
        }
    }
  
   async searchFlights(params){
        try{
            const response = await this.amadeus.shopping.flightOffersSearch.get(
                {
                    airlineCodes: params.componentName,
                    originLocationCode: params.origin,
                    destinationLocationCode: params.destination,
                    departureDate: params.date,
                    adults: params.numberOfTravelers || 1,
                    
                }
            );
            return response.data;
        }catch(error){
            console.error("Erro ao buscar voos:", error);
            throw error;
        }
}
    async getFlightPrice(amadeusId){
        try{
           const response = await this.amadeus.shopping.flightOffersSearch.get({
                id: amadeusId  
            });
            if(!response.data || response.data.length === 0){
                throw new Error("Nenhum dado de voo encontrado para o ID fornecido.");
            }
            const flight = response.data[0];
            const moneyPrice = parseFloat(flight.price.total);

            const milesPrice = this.calculateMilesPrice(moneyPrice, 'FLIGHT');
            return { moneyPrice, milesPrice };
        }catch(error){
            console.error("Erro ao obter preço do voo:", error);
            throw error;
        }
    }
    async searchHotels(params){
        try{
            const response = await this.amadeus.shopping.hotelOffers.get(
                {
                    cityCode: params.destination,
                    checkInDate: params.departureDate,
                    checkOutDate: params.returnDate,
                    roomQuantity: params.numberOfTravelers || 1,
                    adults: params.numberOfTravelers || 1,
                    
                }
            );
            return response.data;
        }catch(error){
            console.error("Erro ao buscar hotéis:", error);
            throw error;
        }
}

    async getHotelPrice(amadeusId){
        try{
           const response = await this.amadeus.shopping.hotelOffers.get({
                hotelIds: amadeusId  
            });

            if(!response.data || response.data.length === 0){
                throw new Error("Nenhum dado de hotel encontrado para o ID fornecido.");
            }
            const hotelOffer = response.data[0];
            const moneyPrice = parseFloat(hotelOffer.offers[0].price.total);
            const milesPrice = this.calculateMilesPrice(moneyPrice, 'HOTEL');
            return { moneyPrice, milesPrice };
        }catch(error){
            console.error("Erro ao obter preço do hotel:", error);
            throw error;
        }
    }
}