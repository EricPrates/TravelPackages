import Amadeus from 'amadeus';
import travelPackageModel from '../../models/TravelPackage.model.js';
export class AmadeusClient {
    constructor() {
        this.amadeus = new Amadeus({
            clientId: process.env.API_KEY,
            clientSecret: process.env.API_SECRET
        });
    }

    fetchAmadeusOptionsAsync = async (travelPackage) => {
        try {
            const formattedDepartureDate = travelPackage?.departureDate
                ? new Date(travelPackage.departureDate).toISOString().split('T')[0]
                : null;
            const formattedReturnDate = travelPackage?.returnDate
                ? new Date(travelPackage.returnDate).toISOString().split('T')[0]
                : null;
                const formattedCheckinDate =  travelPackage?.checkInDate
                ? new Date(travelPackage.checkInDate).toISOString().split('T')[0]
                : null;
            const formattedCheckoutDate = travelPackage?.checkOutDate
                ? new Date(travelPackage.checkOutDate).toISOString().split('T')[0]
                : null;

            const [
                flightsResult,
                hotelsResult,
                activitiesResult,
                carRentalsResult
            ] = await Promise.all([
                this.searchFlights({
                    origin: travelPackage.origin,
                    destination: travelPackage.destination,
                    departureDate: formattedDepartureDate,
                    returnDate: formattedReturnDate,
                    numberOfTravelers: travelPackage.numberOfTravelers
                }).catch(err => { console.error('searchFlights failed', err); return []; }),

                this.searchHotels({
                    destination: travelPackage.destination,
                    checkin: formattedCheckinDate,
                    checkout: formattedCheckoutDate,
                    numberOfTravelers: travelPackage.numberOfTravelers
                }).catch(err => { console.error('searchHotels failed', err); return []; }),

                this.searchActivities({
                    destination: travelPackage.destination
                }).catch(err => { console.error('searchActivities failed', err); return []; }),

                this.searchCarRentals({
                    destination: travelPackage.destination,
                    checkin: formattedCheckinDate,
                    checkout: formattedCheckoutDate
                }).catch(err => { console.error('searchCarRentals failed', err); return []; })
            ]);

            return {
                flights: flightsResult,
                hotels: hotelsResult,
                activities: activitiesResult,
                carRentals: carRentalsResult
            };
        } catch (error) {
            console.error('Erro ao buscar opções Amadeus:', error);
            throw error;
        }
    };
     async fetchOptionsByType(travelPackage, type) {
        const departureDate = travelPackage?.departureDate ? new Date(travelPackage.departureDate).toISOString().split('T')[0] : null;
        const returnDate = travelPackage?.returnDate ? new Date(travelPackage.returnDate).toISOString().split('T')[0] : null;

        switch (type) {
            case 'FLIGHT':
                return this.searchFlights({ origin: travelPackage.origin, destination: travelPackage.destination, departureDate, returnDate, numberOfTravelers: travelPackage.numberOfTravelers });
            case 'HOTEL':
                return this.searchHotels({ destination: travelPackage.destination, checkin: departureDate, checkout: returnDate, numberOfTravelers: travelPackage.numberOfTravelers });
            case 'ACTIVITY':
                return this.searchActivities({ destination: travelPackage.destination });
            case 'CAR_RENTAL':
                return this.searchCarRentals({ destination: travelPackage.destination, departureDate, returnDate });
            default:
                throw new Error('Tipo inválido');
        }
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
            const codes = await this.searchCityCode(origin, destination, "FLIGHT");
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
        const { destination, checkin, checkout, numberOfTravelers } = params;
        try {
            const cityCode = await this.searchCityCode(undefined, destination, "HOTEL");
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
        const { destination } = params;
        try {
            const cityCode = await this.searchCityCode(undefined, destination, "ACTIVITY");
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
            const cityCode = await this.searchCityCode(undefined, destination, "CAR_RENTAL");
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
    async searchCityCode(originCity, destinationCity, type) {
        try {
            const destPromise = destinationCity
                ? this.amadeus.referenceData.locations.get({ keyword: destinationCity, subType: 'CITY' })
                : Promise.resolve(null);
            const origPromise = originCity
                ? this.amadeus.referenceData.locations.get({ keyword: originCity, subType: 'CITY' })
                : Promise.resolve(null);

            const [destinationCode, originCode] = await Promise.all([destPromise, origPromise]);

            const destData = destinationCode?.data && destinationCode.data.length ? destinationCode.data[0] : null;
            const origData = originCode?.data && originCode.data.length ? originCode.data[0] : null;

            if (type === "FLIGHT") {
                if (!origData || !destData) return null;
                return { originCode: origData.iataCode || origData.id, destinationCode: destData.iataCode || destData.id };
            } else {
                if (!destData) return null;
                return destData.iataCode || destData.id;
            }
        } catch (err) {
            console.error("Erro ao buscar códigos de cidade:", err);
            throw err;
        }
    }


}
export const amadeusClient = new AmadeusClient();