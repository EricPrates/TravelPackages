// Mock Service para complementar dados limitados do Amadeus
export class MockDataService {
    constructor() {
        this.hotelNames = [
            'Grand Hotel', 'Plaza Hotel', 'Royal Palace', 'Sunset Resort',
            'Ocean View Hotel', 'Mountain Lodge', 'City Center Inn',
            'Luxury Suites', 'Comfort Hotel', 'Paradise Resort'
        ];

        this.carModels = [
            { model: 'Fiat Argo', category: 'Econômico', dailyRate: 80 },
            { model: 'Chevrolet Onix', category: 'Econômico', dailyRate: 85 },
            { model: 'Toyota Corolla', category: 'Intermediário', dailyRate: 150 },
            { model: 'Honda Civic', category: 'Intermediário', dailyRate: 160 },
            { model: 'Jeep Compass', category: 'SUV', dailyRate: 220 },
            { model: 'Toyota SW4', category: 'SUV', dailyRate: 280 }
        ];

        // Mapeamento de códigos de aeroporto para códigos de cidade
        this.airportToCityMap = {
            'GRU': 'SAO', // São Paulo Guarulhos → São Paulo
            'CGH': 'SAO', // São Paulo Congonhas → São Paulo
            'GIG': 'RIO', // Rio Galeão → Rio de Janeiro
            'SDU': 'RIO', // Rio Santos Dumont → Rio de Janeiro
            'BSB': 'BSB', // Brasília
            'SSA': 'SSA', // Salvador
            'FOR': 'FOR', // Fortaleza
            'REC': 'REC', // Recife
            'POA': 'POA', // Porto Alegre
            'JFK': 'NYC', // JFK → Nova York
            'LGA': 'NYC', // LaGuardia → Nova York
            'EWR': 'NYC', // Newark → Nova York
            'CDG': 'PAR', // Charles de Gaulle → Paris
            'ORY': 'PAR', // Orly → Paris
            'LHR': 'LON', // Heathrow → Londres
            'LGW': 'LON', // Gatwick → Londres
            'MAD': 'MAD', // Madrid
            'BCN': 'BCN', // Barcelona
            'FCO': 'ROM', // Fiumicino → Roma
        };

        this.cityData = {
            'SAO': { name: 'São Paulo', country: 'Brasil', lat: -23.5505, lon: -46.6333 },
            'RIO': { name: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lon: -43.1729 },
            'BSB': { name: 'Brasília', country: 'Brasil', lat: -15.7939, lon: -47.8828 },
            'SSA': { name: 'Salvador', country: 'Brasil', lat: -12.9714, lon: -38.5014 },
            'FOR': { name: 'Fortaleza', country: 'Brasil', lat: -3.7172, lon: -38.5433 },
            'REC': { name: 'Recife', country: 'Brasil', lat: -8.0476, lon: -34.8770 },
            'POA': { name: 'Porto Alegre', country: 'Brasil', lat: -30.0346, lon: -51.2177 },
            'PAR': { name: 'Paris', country: 'França', lat: 48.8566, lon: 2.3522 },
            'LON': { name: 'Londres', country: 'Reino Unido', lat: 51.5074, lon: -0.1278 },
            'NYC': { name: 'Nova York', country: 'Estados Unidos', lat: 40.7128, lon: -74.0060 },
            'MAD': { name: 'Madrid', country: 'Espanha', lat: 40.4168, lon: -3.7038 },
            'ROM': { name: 'Roma', country: 'Itália', lat: 41.9028, lon: 12.4964 },
            'BCN': { name: 'Barcelona', country: 'Espanha', lat: 41.3851, lon: 2.1734 }
        };
    }

    // Converter código de aeroporto para código de cidade
    getCityCode(code) {
        return this.airportToCityMap[code] || code;
    }

    calculateMilesPrice(moneyPrice, type) {
        switch (type) {
            case 'HOTEL':
                return Math.round(moneyPrice * 80);
            case 'CAR_RENTAL':
                return Math.round(moneyPrice * 70);
            default:
                return Math.round(moneyPrice * 100);
        }
    }

    getCityName(code) {
        const cityCode = this.getCityCode(code);
        return this.cityData[cityCode]?.name || code;
    }

    getCityCoordinates(code) {
        const cityCode = this.getCityCode(code);
        const city = this.cityData[cityCode];
        if (city) {
            return {
                latitude: city.lat,
                longitude: city.lon,
                cityName: city.name,
                cityCode: cityCode
            };
        }
        return null;
    }

    calculateDays(checkin, checkout) {
        if (!checkin || !checkout) return 3;
        const start = new Date(checkin);
        const end = new Date(checkout);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 3;
    }

    searchHotels(params) {
        const { destination, checkin, checkout, numberOfTravelers = 1 } = params;
        
        const cityName = this.getCityName(destination);
        const days = this.calculateDays(checkin, checkout);
        const hotels = [];
        const numHotels = 5 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numHotels; i++) {
            const hotelName = this.hotelNames[i % this.hotelNames.length];
            const rating = 3 + Math.random() * 2;
            const basePrice = 200 + Math.random() * 500;
            const totalPrice = basePrice * days;
            
            hotels.push({
                id: `MOCK_HOTEL_${destination}_${i}`,
                type: 'hotel-offers',
                hotel: {
                    hotelId: `MOCK_${destination}_${i}`,
                    name: `${hotelName} ${cityName}`,
                    rating: rating.toFixed(1),
                    cityCode: destination
                },
                available: true,
                offers: [{
                    id: `OFFER_${i}`,
                    checkInDate: checkin,
                    checkOutDate: checkout,
                    roomQuantity: 1,
                    guests: {
                        adults: numberOfTravelers
                    },
                    price: {
                        currency: 'BRL',
                        total: totalPrice.toFixed(2),
                        base: (totalPrice * 0.85).toFixed(2)
                    },
                    room: {
                        type: i % 2 === 0 ? 'Standard Double Room' : 'Deluxe Suite',
                        description: {
                            text: 'Quarto confortável com WiFi, TV, ar-condicionado'
                        }
                    }
                }],
                moneyPrice: parseFloat(totalPrice.toFixed(2)),
                milesPrice: this.calculateMilesPrice(totalPrice, 'HOTEL'),
                amenities: this.getRandomAmenities(),
                address: `Centro de ${cityName}`,
                distance: (Math.random() * 5).toFixed(1) + ' km do centro'
            });
        }

        return hotels;
    }

    searchCarRentals(params) {
        const { destination, checkin, checkout } = params;
        
        const cityName = this.getCityName(destination);
        const days = this.calculateDays(checkin, checkout);
        const cars = [];

        this.carModels.forEach((car, index) => {
            const totalPrice = car.dailyRate * days;
            
            cars.push({
                id: `MOCK_CAR_${destination}_${index}`,
                type: 'car-rental',
                vehicle: {
                    name: car.model,
                    category: car.category,
                    transmission: index % 2 === 0 ? 'Automático' : 'Manual',
                    fuel: 'Gasolina',
                    seats: car.category === 'SUV' ? 7 : 5,
                    doors: car.category === 'SUV' ? 4 : 4,
                    airConditioning: true
                },
                pickUpLocation: {
                    name: `Aeroporto de ${cityName}`,
                    address: `Terminal de ${cityName}`
                },
                pickUpDate: checkin,
                dropOffDate: checkout,
                estimatedTotal: {
                    amount: totalPrice.toFixed(2),
                    currency: 'BRL'
                },
                ratePerDay: {
                    amount: car.dailyRate.toFixed(2),
                    currency: 'BRL'
                },
                moneyPrice: parseFloat(totalPrice.toFixed(2)),
                milesPrice: this.calculateMilesPrice(totalPrice, 'CAR_RENTAL'),
                displayPrice: totalPrice.toFixed(2),
                displayMiles: this.calculateMilesPrice(totalPrice, 'CAR_RENTAL').toLocaleString(),
                provider: 'Localiza',
                unlimited_mileage: true
            });
        });

        return cars;
    }

    getRandomAmenities() {
        const allAmenities = [
            'WiFi Gratuito', 'Piscina', 'Academia', 'Café da Manhã',
            'Estacionamento', 'Restaurante', 'Bar', 'Spa',
            'Room Service', 'Ar Condicionado', 'TV a Cabo'
        ];
        
        const numAmenities = 4 + Math.floor(Math.random() * 4);
        return allAmenities
            .sort(() => Math.random() - 0.5)
            .slice(0, numAmenities);
    }
}

export const mockDataService = new MockDataService();
