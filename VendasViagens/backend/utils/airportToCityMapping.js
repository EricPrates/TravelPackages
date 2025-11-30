/**
 * Mapeamento de códigos IATA de aeroportos para códigos de cidade
 * Usado para buscar hotéis e carros, que precisam de cityCode
 */

export const airportToCityMap = {
    // Brasil
    'GRU': 'SAO', // São Paulo (Guarulhos) -> São Paulo
    'CGH': 'SAO', // São Paulo (Congonhas) -> São Paulo
    'GIG': 'RIO', // Rio de Janeiro (Galeão) -> Rio de Janeiro
    'SDU': 'RIO', // Rio de Janeiro (Santos Dumont) -> Rio de Janeiro
    'BSB': 'BSB', // Brasília
    'SSA': 'SSA', // Salvador
    'FOR': 'FOR', // Fortaleza
    'REC': 'REC', // Recife
    'CWB': 'CWB', // Curitiba
    'POA': 'POA', // Porto Alegre
    'BHZ': 'BHZ', // Belo Horizonte (Confins)
    'CNF': 'BHZ', // Belo Horizonte (Confins) -> Belo Horizonte
    'MAO': 'MAO', // Manaus
    'BEL': 'BEL', // Belém
    'VCP': 'SAO', // Viracopos -> São Paulo
    
    // América do Norte
    'JFK': 'NYC', // Nova York (JFK) -> Nova York
    'LGA': 'NYC', // Nova York (LaGuardia) -> Nova York
    'EWR': 'NYC', // Newark -> Nova York
    'LAX': 'LAX', // Los Angeles
    'ORD': 'CHI', // Chicago (O'Hare) -> Chicago
    'MDW': 'CHI', // Chicago (Midway) -> Chicago
    'MIA': 'MIA', // Miami
    'SFO': 'SFO', // São Francisco
    'SEA': 'SEA', // Seattle
    'BOS': 'BOS', // Boston
    'DFW': 'DFW', // Dallas
    'ATL': 'ATL', // Atlanta
    'YYZ': 'YTO', // Toronto (Pearson) -> Toronto
    'YTZ': 'YTO', // Toronto (Billy Bishop) -> Toronto
    'YUL': 'YMQ', // Montreal (Trudeau) -> Montreal
    'YVR': 'YVR', // Vancouver
    'MEX': 'MEX', // Cidade do México
    'CUN': 'CUN', // Cancún
    
    // Europa
    'CDG': 'PAR', // Paris (Charles de Gaulle) -> Paris
    'ORY': 'PAR', // Paris (Orly) -> Paris
    'LHR': 'LON', // Londres (Heathrow) -> Londres
    'LGW': 'LON', // Londres (Gatwick) -> Londres
    'STN': 'LON', // Londres (Stansted) -> Londres
    'LCY': 'LON', // Londres (City) -> Londres
    'MAD': 'MAD', // Madrid
    'BCN': 'BCN', // Barcelona
    'FCO': 'ROM', // Roma (Fiumicino) -> Roma
    'CIA': 'ROM', // Roma (Ciampino) -> Roma
    'MXP': 'MIL', // Milão (Malpensa) -> Milão
    'LIN': 'MIL', // Milão (Linate) -> Milão
    'AMS': 'AMS', // Amsterdam
    'FRA': 'FRA', // Frankfurt
    'MUC': 'MUC', // Munique
    'BER': 'BER', // Berlim
    'VIE': 'VIE', // Viena
    'ZRH': 'ZRH', // Zurique
    'LIS': 'LIS', // Lisboa
    'OPO': 'OPO', // Porto
    'ATH': 'ATH', // Atenas
    'IST': 'IST', // Istambul
    'DUB': 'DUB', // Dublin
    'CPH': 'CPH', // Copenhague
    'OSL': 'OSL', // Oslo
    'STO': 'STO', // Estocolmo
    'HEL': 'HEL', // Helsinque
    'PRG': 'PRG', // Praga
    'BUD': 'BUD', // Budapeste
    'WAW': 'WAW', // Varsóvia
    
    // Ásia
    'NRT': 'TYO', // Tóquio (Narita) -> Tóquio
    'HND': 'TYO', // Tóquio (Haneda) -> Tóquio
    'KIX': 'OSA', // Osaka (Kansai) -> Osaka
    'ITM': 'OSA', // Osaka (Itami) -> Osaka
    'ICN': 'SEL', // Seul (Incheon) -> Seul
    'GMP': 'SEL', // Seul (Gimpo) -> Seul
    'PEK': 'BJS', // Pequim (Capital) -> Pequim
    'PKX': 'BJS', // Pequim (Daxing) -> Pequim
    'PVG': 'SHA', // Xangai (Pudong) -> Xangai
    'SHA': 'SHA', // Xangai (Hongqiao) -> Xangai
    'HKG': 'HKG', // Hong Kong
    'SIN': 'SIN', // Singapura
    'BKK': 'BKK', // Bangkok
    'KUL': 'KUL', // Kuala Lumpur
    'CGK': 'JKT', // Jacarta (Soekarno-Hatta) -> Jacarta
    'DEL': 'DEL', // Nova Delhi
    'BOM': 'BOM', // Mumbai
    'DXB': 'DXB', // Dubai
    'AUH': 'AUH', // Abu Dhabi
    'DOH': 'DOH', // Doha
    
    // Oceania
    'SYD': 'SYD', // Sydney
    'MEL': 'MEL', // Melbourne
    'BNE': 'BNE', // Brisbane
    'PER': 'PER', // Perth
    'AKL': 'AKL', // Auckland
    
    // América do Sul
    'EZE': 'BUE', // Buenos Aires (Ezeiza) -> Buenos Aires
    'AEP': 'BUE', // Buenos Aires (Aeroparque) -> Buenos Aires
    'SCL': 'SCL', // Santiago
    'LIM': 'LIM', // Lima
    'BOG': 'BOG', // Bogotá
    'UIO': 'UIO', // Quito
    'MVD': 'MVD', // Montevidéu
    'ASU': 'ASU', // Assunção
    'FTE': 'FTE', // El Calafate
    'USH': 'USH', // Ushuaia
    
    // África
    'JNB': 'JNB', // Joanesburgo
    'CPT': 'CPT', // Cidade do Cabo
    'CAI': 'CAI', // Cairo
    'NBO': 'NBO', // Nairobi
    'ADD': 'ADD', // Adis Abeba
    'LOS': 'LOS', // Lagos
    'CAS': 'CAS', // Casablanca
    
    // Ilhas e Destinos Turísticos
    'MLE': 'MLE', // Malé (Maldivas)
    'DPS': 'DPS', // Denpasar (Bali)
    'HNL': 'HNL', // Honolulu
    'PPT': 'PPT', // Papeete (Tahiti)
    'NAN': 'NAN', // Nadi (Fiji)
};

/**
 * Converte código de aeroporto para código de cidade
 * @param {string} airportCode - Código IATA do aeroporto (ex: 'GRU')
 * @returns {string} - Código IATA da cidade (ex: 'SAO')
 */
export function getCityCode(airportCode) {
    if (!airportCode) return null;
    
    const code = airportCode.toUpperCase();
    
    // Se existe no mapeamento, retorna o código da cidade
    if (airportToCityMap[code]) {
        return airportToCityMap[code];
    }
    
    // Se não existe, assume que o código já é de cidade
    // (muitos aeroportos têm o mesmo código da cidade)
    return code;
}

/**
 * Verifica se um código é de aeroporto ou cidade
 * @param {string} code - Código IATA
 * @returns {object} - { isAirport: boolean, cityCode: string }
 */
export function analyzeCode(code) {
    if (!code) return { isAirport: false, cityCode: null };
    
    const upperCode = code.toUpperCase();
    const cityCode = getCityCode(upperCode);
    
    return {
        isAirport: airportToCityMap[upperCode] !== undefined,
        airportCode: upperCode,
        cityCode: cityCode,
        needsConversion: upperCode !== cityCode
    };
}

/**
 * Lista de códigos comuns para autocomplete
 */
export const popularDestinations = [
    // Brasil
    { airport: 'GRU', city: 'SAO', name: 'São Paulo', country: 'Brasil' },
    { airport: 'GIG', city: 'RIO', name: 'Rio de Janeiro', country: 'Brasil' },
    { airport: 'BSB', city: 'BSB', name: 'Brasília', country: 'Brasil' },
    { airport: 'SSA', city: 'SSA', name: 'Salvador', country: 'Brasil' },
    
    // Internacional
    { airport: 'JFK', city: 'NYC', name: 'Nova York', country: 'EUA' },
    { airport: 'CDG', city: 'PAR', name: 'Paris', country: 'França' },
    { airport: 'LHR', city: 'LON', name: 'Londres', country: 'Reino Unido' },
    { airport: 'NRT', city: 'TYO', name: 'Tóquio', country: 'Japão' },
    { airport: 'DXB', city: 'DXB', name: 'Dubai', country: 'EAU' },
    { airport: 'MLE', city: 'MLE', name: 'Maldivas', country: 'Maldivas' },
    { airport: 'CUN', city: 'CUN', name: 'Cancún', country: 'México' },
    { airport: 'FTE', city: 'FTE', name: 'El Calafate', country: 'Argentina' },
];
