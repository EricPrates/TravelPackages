import Amadeus from 'amadeus';

export class AmadeusClient {
    constructor() {
        this.amadeus = new Amadeus({
            clientId: process.env.API_KEY,
            clientSecret: process.env.API_SECRET
        });
    }

    calculateMilesPrice(moneyPrice, type) {
        switch (type) {
            case 'FLIGHT':
                return Math.round(moneyPrice * 90);
            case 'HOTEL':
                return Math.round(moneyPrice * 80);
            case 'ACTIVITY':
                return Math.round(moneyPrice * 50);
            default:
                return Math.round(moneyPrice * 100);
        }
    }

    async searchFlights(params) {
        const { origin, destination, departureDate, returnDate, numberOfTravelers } = params;
        try {
            const codes = await this.searchByCity(origin, destination,"FLIGHT");
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
        const {destination, checkin, checkout, numberOfTravelers} = params;
        try {
            const cityCode = await this.searchByCity(undefined, destination,"HOTEL");
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


    async searchActivities(params) {
        const {destination} = params;
        try {
            const cityCode = await this.searchByCity(undefined, destination,"ACTIVITY");
            const response = await this.amadeus.shopping.activities.get(
                {
                    cityCode: cityCode,
                    radius: 30,
                    radiusUnit: 'KM',
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

    async searchCarRentals(params) {
        const { destination, returnDate, departureDate } = params;
        try {
            const cityCode = await this.searchByCity( undefined, destination, "CAR_RENTALS");
            const response = await this.amadeus.shopping.carRentals.get(
                {
                    cityCode: cityCode,
                    pickUpDateTime: departureDate,
                    dropOffDateTime: returnDate,
                    currency: 'BRL'
                }
            );
            const responseWithPrices = response.data.map(car => {

                const price = car.estimatedTotal;
                const moneyPrice = parseFloat(price.amount);
                const milesPrice = this.calculateMilesPrice(moneyPrice, 'CAR_RENTAL');
                return {
                    ...car,
                    moneyPrice: moneyPrice,
                    milesPrice: milesPrice,
                    displayPrice: moneyPrice.toFixed(2),
                    displayMiles: milesPrice.toLocaleString(),
                    currency: price.currency
                };
            });
            return responseWithPrices;

        } catch (error) {
            console.error("Erro ao buscar aluguel de carros:", error);
            throw error;
        }
    }
    async searchCityCode(originCity, destinationCity, type){
        const destinationCode= await this.amadeus.referenceData.locations.get({
            keyboard: destinationCity,
            subType: 'CITY'
        });
        const originCode = await this.amadeus.referenceData.locations.get({
            keyboard: originCity,
            subType:'CITY'
        })
        if (!destinationCity.data.length && !originCity.data.length){
            throw new Error("Cidade não encontrada")
        }
        if(type == "FLIGHT"){
            return {originCode, destinationCode}
        }
        else{
            return destinationCode
        }
        
    }

   
}
export const amadeusClient = new AmadeusClient();