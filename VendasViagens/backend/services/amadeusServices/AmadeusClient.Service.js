import Amadeus from 'amadeus';
import { parse } from 'dotenv';

export class AmadeusClient {
    constructor() {
        this.amadeus = new Amadeus({
            clientId: process.env.AMADEUS_CLIENT_ID,
            clientSecret: process.env.AMADEUS_CLIENT_SECRET
        });
    }

    calculateMilesPrice(moneyPrice, type) {
        switch (type) {
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

    async searchFlights(params) {
        const { origin, destination, departureDate, returnDate, numberOfTravelers } = params;
        try {
            const codes = await this.searchFlightsByCity(origin, destination);
            const flightParams = {
            originLocationCode: codes.originCode,
            destinationLocationCode: codes.destinationCode,
            departureDate: departureDate,
            adults: numberOfTravelers || 1,
           
        };
            if (returnDate) {
                flightParams.returnDate = returnDate;
            }
            
            const response = await this.amadeus.shopping.flightOffersSearch.get(flightParams);

           const responseWithPrices = response.data.map(flight => {
                return {
                    ...flight,
                    moneyPrice: parseFloat(flight.price.total),
                    milesPrice: this.calculateMilesPrice(parseFloat(flight.price.total), 'FLIGHT')
                };
            });
            return responseWithPrices;
        } catch (error) {
            console.error("Erro ao buscar voos:", error);
            throw error;
        }
    }

   
    async searchHotels(params) {
        const [destination, checkin, checkout, numberOfTravelers] = params;
        try {
            const codes = await this.searchHotelsByCity(destination);
            const response = await this.amadeus.shopping.hotelOffers.get(
                {
                    cityCode: cityCode,
                    checkInDate: checkin,
                    checkOutDate: checkout,
                    adults: numberOfTravelers || 1

                }
            );
           const responseWithPrices = response.data.map(hotel => {
                return {
                    ...hotel,
                    moneyPrice: parseFloat(hotel.offers[0].price.total),
                    milesPrice: this.calculateMilesPrice(parseFloat(hotel.offers[0].price.total), 'HOTEL')
                };
            });
            return responseWithPrices;
        } catch (error) {
            console.error("Erro ao buscar hotéis:", error);
            throw error;
        }
    }

    async searchHotelsByCity(city) {
        try {
            const response = await this.amadeus.referenceData.locations.get({
                keyword: city,
                subType: 'CITY'
            });
            if (!response.data.length) {
                throw new Error('Cidade não encontrada');
            }
            return response.data[0].iataCode;
        } catch (error) {
            console.error("Erro ao buscar código IATA da cidade:", error);
            throw error;
        }
    }

    async searchActivities(params) {
       const [destination] = params;
        try {
            const code = await this.searchActivitiesByCity(destination);
            const response = await this.amadeus.shopping.activities.get(
                {
                    cityCode: code.cityCode,
                    radius:30,
                    radiusUnit:'KM',
                    categories: ['SIGHTSEEING', 'SHOPPING', 'NIGHTLIFE']
                }
            );
            const responseWithPrices = response.data.map(activity => {
           
            const price = activity.price; 
            const moneyPrice = parseFloat(price.amount); 
            const milesPrice = this.calculateMilesPrice(moneyPrice, 'ACTIVITY');
            
            return {
                ...activity,
                moneyPrice: moneyPrice,
                milesPrice: milesPrice,
                displayPrice: moneyPrice.toFixed(2),
                displayMiles: milesPrice.toLocaleString()
            };
        });
            return responseWithPrices;
        } catch (error) {
            console.error("Erro ao buscar atividades:", error);
            throw error;
        }
    }
    async getActivityPrice(amadeusId) {
        try {
            const response = await this.amadeus.shopping.activities.get({
                ids: amadeusId
            });
            if (!response.data || response.data.length === 0) {
                throw new Error("Nenhum dado de atividade encontrado para o ID fornecido.");
            }
            const activities = response.data[0];
            const moneyPrice = parseFloat(activities.price.total);
            const milesPrice = this.calculateMilesPrice(moneyPrice, 'ACTIVITY');
            return { moneyPrice, milesPrice };
        } catch (error) {
            console.error("Erro ao obter preço da atividade:", error);
            throw error;
        }
    }
    async searchCarRentals(params) {
        try {
            const response = await this.amadeus.shopping.carRentals.get(
                {
                    cityCode: params.cityCode,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar aluguel de carros:", error);
            throw error;
        }
    }
    async getCarRentalPrice(amadeusId) {
        try {
            const response = await this.amadeus.shopping.carRentals.get({
                ids: amadeusId
            });

            if (!response.data || response.data.length === 0) {
                throw new Error("Nenhum dado de aluguel de carro encontrado para o ID fornecido.");
            }
            const carRental = response.data[0];
            const moneyPrice = parseFloat(carRental.price.total);
            const milesPrice = this.calculateMilesPrice(moneyPrice, 'CAR_RENTAL');
            return { moneyPrice, milesPrice };
        } catch (error) {
            console.error("Erro ao obter preço do aluguel de carro:", error);
            throw error;
        }
    }

    async searchFlightsByCity(originCity, destinationCity) {
    try {
        const [origemResponse, destinoResponse] = await Promise.all([
            this.amadeus.referenceData.locations.get({
                keyword: originCity,
                subType: 'CITY'
            }),
            this.amadeus.referenceData.locations.get({
                keyword: destinationCity,
                subType: 'CITY'
            })
        ]);
        if (!origemResponse.data.length || !destinoResponse.data.length) {
            throw new Error('Cidade de origem ou destino não encontrada');
        }

        const originCode = origemResponse.data[0]?.iataCode;
        const destinationCode = destinoResponse.data[0]?.iataCode;
        return { originCode, destinationCode };
    } catch (error) {
        console.error("Erro ao buscar códigos IATA das cidades:", error);
        throw error;
    }
}
    async searchActivitiesByCity(city) {
        try {
            const response = await this.amadeus.referenceData.locations.get({
                keyword: city,
                subType: 'CITY'
            });
            if (!response.data.length) {
                throw new Error('Cidade não encontrada');
            }
            return response.data[0].iataCode;
        } catch (error) {
            console.error("Erro ao buscar código IATA da cidade:", error);
            throw error;
        }
    }
}
export const amadeusClient = new AmadeusClient();