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
        const COORDINATES_MAP = {
            // Brasil - Principais
            'GRU': { latitude: -23.4356, longitude: -46.4731, cityName: 'São Paulo', iataCode: 'GRU' },
            'CGH': { latitude: -23.6267, longitude: -46.6556, cityName: 'São Paulo Congonhas', iataCode: 'CGH' },
            'GIG': { latitude: -22.8099, longitude: -43.2505, cityName: 'Rio de Janeiro', iataCode: 'GIG' },
            'BSB': { latitude: -15.8697, longitude: -47.9208, cityName: 'Brasília', iataCode: 'BSB' },
            'SSA': { latitude: -12.9086, longitude: -38.3224, cityName: 'Salvador', iataCode: 'SSA' },
            'FOR': { latitude: -3.7763, longitude: -38.5326, cityName: 'Fortaleza', iataCode: 'FOR' },
            'REC': { latitude: -8.1264, longitude: -34.9236, cityName: 'Recife', iataCode: 'REC' },
            'CWB': { latitude: -25.5284, longitude: -49.1759, cityName: 'Curitiba', iataCode: 'CWB' },
            'POA': { latitude: -29.9939, longitude: -51.1711, cityName: 'Porto Alegre', iataCode: 'POA' },
            'BEL': { latitude: -1.3792, longitude: -48.4761, cityName: 'Belém', iataCode: 'BEL' },
            'MAO': { latitude: -3.0386, longitude: -60.0497, cityName: 'Manaus', iataCode: 'MAO' },
            'JPA': { latitude: -7.1475, longitude: -34.9486, cityName: 'João Pessoa', iataCode: 'JPA' },
            'NAT': { latitude: -5.7680, longitude: -35.3761, cityName: 'Natal', iataCode: 'NAT' },
            'MCZ': { latitude: -9.5108, longitude: -35.7917, cityName: 'Maceió', iataCode: 'MCZ' },
            'AJU': { latitude: -10.9840, longitude: -37.0703, cityName: 'Aracaju', iataCode: 'AJU' },
            'FRC': { latitude: -20.5919, longitude: -47.3828, cityName: 'Franca', iataCode: 'FRC' },
            'VCP': { latitude: -23.0074, longitude: -47.1344, cityName: 'Campinas', iataCode: 'VCP' },
            'CNF': { latitude: -19.6244, longitude: -43.9719, cityName: 'Belo Horizonte', iataCode: 'CNF' },
            'VIX': { latitude: -20.2581, longitude: -40.2864, cityName: 'Vitória', iataCode: 'VIX' },
            'FLN': { latitude: -27.6703, longitude: -48.5525, cityName: 'Florianópolis', iataCode: 'FLN' },
            'IGU': { latitude: -25.5953, longitude: -54.4872, cityName: 'Foz do Iguaçu', iataCode: 'IGU' },
            
            // Europa
            'CDG': { latitude: 49.0097, longitude: 2.5479, cityName: 'Paris', iataCode: 'CDG' },
            'LHR': { latitude: 51.4700, longitude: -0.4543, cityName: 'London', iataCode: 'LHR' },
            'BCN': { latitude: 41.2974, longitude: 2.0833, cityName: 'Barcelona', iataCode: 'BCN' },
            'MAD': { latitude: 40.4983, longitude: -3.5676, cityName: 'Madrid', iataCode: 'MAD' },
            'LIS': { latitude: 38.7742, longitude: -9.1342, cityName: 'Lisbon', iataCode: 'LIS' },
            'FRA': { latitude: 50.0379, longitude: 8.5622, cityName: 'Frankfurt', iataCode: 'FRA' },
            'AMS': { latitude: 52.3105, longitude: 4.7683, cityName: 'Amsterdam', iataCode: 'AMS' },
            'IST': { latitude: 41.2753, longitude: 28.7519, cityName: 'Istanbul', iataCode: 'IST' },
            
            // América do Norte
            'JFK': { latitude: 40.6413, longitude: -73.7781, cityName: 'New York', iataCode: 'JFK' },
            'LAX': { latitude: 33.9416, longitude: -118.4085, cityName: 'Los Angeles', iataCode: 'LAX' },
            'MIA': { latitude: 25.7959, longitude: -80.2870, cityName: 'Miami', iataCode: 'MIA' },
            'ORD': { latitude: 41.9742, longitude: -87.9073, cityName: 'Chicago', iataCode: 'ORD' },
            'SFO': { latitude: 37.6213, longitude: -122.3790, cityName: 'San Francisco', iataCode: 'SFO' },
            'LAS': { latitude: 36.0840, longitude: -115.1537, cityName: 'Las Vegas', iataCode: 'LAS' },
            'MEX': { latitude: 19.4363, longitude: -99.0721, cityName: 'Mexico City', iataCode: 'MEX' },
            'CUN': { latitude: 21.0365, longitude: -86.8771, cityName: 'Cancún', iataCode: 'CUN' },
            
            // América do Sul
            'EZE': { latitude: -34.8222, longitude: -58.5358, cityName: 'Buenos Aires', iataCode: 'EZE' },
            'SCL': { latitude: -33.3930, longitude: -70.7858, cityName: 'Santiago', iataCode: 'SCL' },
            'LIM': { latitude: -12.0219, longitude: -77.1143, cityName: 'Lima', iataCode: 'LIM' },
            'BOG': { latitude: 4.7016, longitude: -74.1469, cityName: 'Bogotá', iataCode: 'BOG' },
            
            // Ásia
            'DXB': { latitude: 25.2532, longitude: 55.3657, cityName: 'Dubai', iataCode: 'DXB' },
            'NRT': { latitude: 35.7720, longitude: 140.3929, cityName: 'Tokyo', iataCode: 'NRT' },
            'SIN': { latitude: 1.3644, longitude: 103.9915, cityName: 'Singapore', iataCode: 'SIN' },
            'BKK': { latitude: 13.6900, longitude: 100.7501, cityName: 'Bangkok', iataCode: 'BKK' },
            'HKG': { latitude: 22.3080, longitude: 113.9185, cityName: 'Hong Kong', iataCode: 'HKG' },
            
            // Oceania
            'SYD': { latitude: -33.9399, longitude: 151.1753, cityName: 'Sydney', iataCode: 'SYD' },
            'MEL': { latitude: -37.6690, longitude: 144.8410, cityName: 'Melbourne', iataCode: 'MEL' },
            'FCO': { latitude: 41.8003, longitude: 12.2389, cityName: 'Rome', iataCode: 'FCO' },
            'AMS': { latitude: 52.3105, longitude: 4.7683, cityName: 'Amsterdam', iataCode: 'AMS' }
        };

       
        if (COORDINATES_MAP[cityCode]) {
            console.log(`📍 Usando coordenadas fixas para ${cityCode}`);
            return COORDINATES_MAP[cityCode];
        }

     
        try {
            const token = await this.getAccessToken();
            
            let url = new URL(`${this.baseURL}/v1/reference-data/locations`);
            url.searchParams.append('keyword', cityCode);
            url.searchParams.append('subType', 'CITY,AIRPORT');

            let response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            let data = await response.json();

            if (!data.data || data.data.length === 0) {
                throw new Error(`Localização ${cityCode} não encontrada`);
            }

            const location = data.data[0];
            console.log(`📍 Coordenadas obtidas da API Amadeus para ${cityCode}`);
            return {
                latitude: location.geoCode.latitude,
                longitude: location.geoCode.longitude,
                cityName: location.name,
                iataCode: location.iataCode
            };

        } catch (error) {
            console.error(`❌ Erro ao buscar coordenadas para ${cityCode}:`, error.message);
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