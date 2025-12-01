import dotenv from 'dotenv';
import { getCityCode, analyzeCode } from '../../utils/airportToCityMapping.js';
dotenv.config();

export class AmadeusClient {
    constructor() {
        this.baseURL = 'https://test.api.amadeus.com';
        this.clientId = process.env.API_KEY;
        this.clientSecret = process.env.API_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
     
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await fetch(`${this.baseURL}/v1/security/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                })
            });

            if (!response.ok) {
                throw new Error(`Falha na autenticação: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (29 * 60 * 1000);
            
            return this.accessToken;

        } catch (error) {
            console.error('Erro ao obter token Amadeus:', error.message);
            throw error;
        }
    }

    fetchAmadeusOptionsAsync = async (travelPackage) => {
        try {
            const formattedDepartureDate = travelPackage?.departureDate
                ? new Date(travelPackage.departureDate).toISOString().split('T')[0]
                : null;
            const formattedReturnDate = travelPackage?.returnDate
                ? new Date(travelPackage.returnDate).toISOString().split('T')[0]
                : null;
            const formattedCheckinDate = travelPackage?.checkInDate
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
                return this.searchFlights({ 
                    origin: travelPackage.origin,
                    destination: travelPackage.destination,
                    departureDate, 
                    returnDate, 
                    numberOfTravelers: travelPackage.numberOfTravelers 
                });
            case 'HOTEL':
                return this.searchHotels({ 
                    destination: travelPackage.destination, 
                    checkin: departureDate, 
                    checkout: returnDate, 
                    numberOfTravelers: travelPackage.numberOfTravelers 
                });
            case 'ACTIVITY':
                return this.searchActivities({ 
                    destination: travelPackage.destination 
                });
            case 'CAR_RENTAL':
                return this.searchCarRentals({ 
                    destination: travelPackage.destination,
                    checkin: departureDate, 
                    checkout: returnDate 
                });
            default:
                throw new Error('Tipo inválido');
        }
    }

    calculateMilesPrice(moneyPrice) {
        return Math.ceil(moneyPrice * 100);
    }

    async getCityCoordinates(cityCode) {
        try {
            const token = await this.getAccessToken();
            
            // Tenta buscar como CITY primeiro
            let url = new URL(`${this.baseURL}/v1/reference-data/locations`);
            url.searchParams.append('keyword', cityCode);
            url.searchParams.append('subType', 'CITY');

            let response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            let data = await response.json();
            
          
            if (!data.data || data.data.length === 0) {
          
                
                url = new URL(`${this.baseURL}/v1/reference-data/locations`);
                url.searchParams.append('keyword', cityCode);
                url.searchParams.append('subType', 'AIRPORT');

                response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                data = await response.json();
            }

            if (!data.data || data.data.length === 0) {
                throw new Error(`Localização ${cityCode} não encontrada`);
            }

            const location = data.data[0];
            return {
                latitude: location.geoCode.latitude,
                longitude: location.geoCode.longitude,
                cityName: location.name,
                iataCode: location.iataCode
            };

        } catch (error) {
          
            throw error;
        }
    }

    async searchHotels(params) {
        const { destination, checkin, checkout, numberOfTravelers } = params;
        try {
            const token = await this.getAccessToken();
            
            // Converter código de aeroporto para código de cidade
            const cityCode = getCityCode(destination);
            const codeInfo = analyzeCode(destination);
            
            console.log(`🏨 Buscando hotéis em ${destination}...`);
            if (codeInfo.needsConversion) {
                console.log(`   ℹ️  Convertido: ${destination} (aeroporto) → ${cityCode} (cidade)`);
            }

            const url = new URL(`${this.baseURL}/v2/shopping/hotel-offers`);
            url.searchParams.append('cityCode', cityCode);
            if (checkin) url.searchParams.append('checkInDate', checkin);
            if (checkout) url.searchParams.append('checkOutDate', checkout);
            url.searchParams.append('adults', numberOfTravelers || 1);
            url.searchParams.append('radius', '5');
            url.searchParams.append('radiusUnit', 'KM');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            const responseWithPrices = data.data.map(hotel => ({
                ...hotel,
                moneyPrice: parseFloat(hotel.offers[0]?.price?.total || 0),
                milesPrice: this.calculateMilesPrice(parseFloat(hotel.offers[0]?.price?.total || 0), 'HOTEL')
            }));

            console.log(`✅ ${responseWithPrices.length} hotéis encontrados em ${cityCode}`);
            return responseWithPrices;

        } catch (error) {
            console.error("❌ Erro ao buscar hotéis:", error.message);
            return [];
        }
    }

    async searchActivities(params) {
        const { destination } = params;
        try {
            const token = await this.getAccessToken();
            
            // Buscar coordenadas usando a API da Amadeus
            const coords = await this.getCityCoordinates(destination);
            
            if (!coords || !coords.latitude || !coords.longitude) {
                console.error(`Coordenadas não encontradas para: ${destination}`);
                return [];
            }

            const url = new URL(`${this.baseURL}/v1/shopping/activities`);
            url.searchParams.append('latitude', coords.latitude);
            url.searchParams.append('longitude', coords.longitude);
            url.searchParams.append('radius', '20');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                return [];
            }

            const responseWithPrices = data.data.map(activity => {
                const price = activity.price;
                const moneyPrice = parseFloat(price?.amount || 0);
                const milesPrice = this.calculateMilesPrice(moneyPrice, 'ACTIVITY');

                return {
                    id: activity.id,
                    type: 'activity',
                    name: activity.name,
                    description: activity.shortDescription || activity.description?.substring(0, 200),
                    moneyPrice: moneyPrice,
                    milesPrice: milesPrice,
                };
            });

            return responseWithPrices;

        } catch (error) {
            console.error("Erro ao buscar atividades:", error.message);
            return [];
        }
    }

    async searchCarRentals(params) {
        const { destination, checkin, checkout } = params;
        try {
            const token = await this.getAccessToken();
            
            // Converter código de aeroporto para código de cidade
            const cityCode = getCityCode(destination);
            const codeInfo = analyzeCode(destination);
            
            console.log(`🚗 Buscando carros em ${destination}...`);
            if (codeInfo.needsConversion) {
                console.log(`   ℹ️  Convertido: ${destination} (aeroporto) → ${cityCode} (cidade)`);
            }

            const url = new URL(`${this.baseURL}/v1/shopping/car-rental-offers`);
            url.searchParams.append('cityCode', cityCode);
            url.searchParams.append('pickUpDateTime', checkin ? `${checkin}T10:00:00` : '2025-12-01T10:00:00');
            url.searchParams.append('dropOffDateTime', checkout ? `${checkout}T10:00:00` : '2025-12-03T10:00:00');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            const responseWithPrices = data.data.map(car => {
                const price = car.estimatedTotal;
                const moneyPrice = parseFloat(price?.amount || 0);
                const milesPrice = this.calculateMilesPrice(moneyPrice, 'CAR_RENTAL');
                
                return {
                    ...car,
                    moneyPrice: moneyPrice,
                    milesPrice: milesPrice,
                    displayPrice: moneyPrice.toFixed(2),
                    displayMiles: milesPrice.toLocaleString(),
                    currency: price?.currency || 'BRL'
                };
            });

       
            return responseWithPrices;

        } catch (error) {
         
            return [];
        }
    }

    async searchFlights(params) {
        const { origin, destination, departureDate, returnDate, numberOfTravelers } = params;
        try {
    
            
            const token = await this.getAccessToken();
            const originCode = origin;
            const destinationCode = destination;

            const url = new URL(`${this.baseURL}/v2/shopping/flight-offers`);
            url.searchParams.append('originLocationCode', originCode);
            url.searchParams.append('destinationLocationCode', destinationCode);
            url.searchParams.append('departureDate', departureDate || '2025-12-01');
            url.searchParams.append('adults', numberOfTravelers || 1);
            url.searchParams.append('currencyCode', 'BRL');
            url.searchParams.append('max', '50');

            if (returnDate) {
                url.searchParams.append('returnDate', returnDate);
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            
    
            const responseWithPrices = data.data.map(flight => {
                const firstSegment = flight.itineraries?.[0]?.segments?.[0] || {};
                const lastSegment = flight.itineraries?.[0]?.segments?.slice(-1)[0] || {};
                
                return {
                    id: flight.id,
                    type: 'flight-offer',
                    source: flight.source,
                    moneyPrice: parseFloat(flight.price.total),
                    milesPrice: this.calculateMilesPrice(parseFloat(flight.price.total), 'FLIGHT'),
                    price: {
                        total: flight.price.total,
                        currency: flight.price.currency
                    },
                    airline: flight.validatingAirlineCodes?.[0] || 'N/A',
                    flightNumber: firstSegment.number || 'N/A',
                    numberOfStops: (flight.itineraries?.[0]?.segments?.length || 1) - 1,
                    duration: flight.itineraries?.[0]?.duration || 'N/A',
                    departure: {
                        iataCode: firstSegment.departure?.iataCode || originCode,
                        at: firstSegment.departure?.at,
                        terminal: firstSegment.departure?.terminal
                    },
                    arrival: {
                        iataCode: lastSegment.arrival?.iataCode || destinationCode,
                        at: lastSegment.arrival?.at,
                        terminal: lastSegment.arrival?.terminal
                    }
                };
            });

            return responseWithPrices;

        } catch (error) {
            console.error('❌ Erro ao buscar voos na Amadeus:', error.message);
            console.error('   Origem:', origin, 'Destino:', destination);
            console.error('   Datas:', departureDate, '-', returnDate);
            return [];
        }
    }
}

export const amadeusClient = new AmadeusClient();