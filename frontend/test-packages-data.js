/**
 * ARQUIVO DE TESTE - Pacotes básicos para verificar funcionamento do fetch de componentes
 * 
 * Este arquivo contém dados de exemplo de pacotes de viagem com seus componentes.
 * Use este arquivo para testar o fetch de options de componentes no frontend.
 */

export const testPackages = [
  {
    // ============================================
    // PACOTE 1: Viagem para Paris Romântico
    // ID: 1
    // ============================================
    id: 1,
    name: "Paris Romântico - 7 dias",
    description: "Pacote completo para lua de mel em Paris com hotel 5 estrelas e passeios exclusivos",
    price: 8500.00,
    duration: 7,
    destination: "Paris, França",
    
    // Componentes deste pacote:
    components: {
      // Voo de ida e volta
      flight: {
        id: 101,
        type: "flight",
        name: "Voo São Paulo - Paris (Air France)",
        description: "Voo direto classe executiva",
        price: 4500.00,
        details: {
          departure: "GRU - São Paulo",
          arrival: "CDG - Paris",
          airline: "Air France",
          flightClass: "Executiva"
        }
      },
      
      // Hotel
      hotel: {
        id: 102,
        type: "hotel",
        name: "Hotel Le Meurice",
        description: "Hotel 5 estrelas no coração de Paris",
        price: 2800.00,
        details: {
          stars: 5,
          nights: 6,
          roomType: "Suite Deluxe",
          breakfast: true
        }
      },
      
      // Passeio 1
      tour1: {
        id: 103,
        type: "tour",
        name: "Tour pela Torre Eiffel",
        description: "Visita guiada com acesso prioritário",
        price: 350.00,
        details: {
          duration: "3 horas",
          guide: "Português/Inglês",
          includes: "Ingresso + Guia"
        }
      },
      
      // Passeio 2
      tour2: {
        id: 104,
        type: "tour",
        name: "Cruzeiro no Rio Sena",
        description: "Jantar romântico no barco",
        price: 450.00,
        details: {
          duration: "2 horas",
          includes: "Jantar + Bebidas"
        }
      },
      
      // Seguro viagem
      insurance: {
        id: 105,
        type: "insurance",
        name: "Seguro Viagem Europa Premium",
        description: "Cobertura completa para 7 dias",
        price: 400.00,
        details: {
          coverage: "USD 100.000",
          includes: "Médico, bagagem, cancelamento"
        }
      }
    }
  },
  
  {
    // ============================================
    // PACOTE 2: Aventura em Cancún
    // ID: 2
    // ============================================
    id: 2,
    name: "Cancún All Inclusive - 5 dias",
    description: "Resort all inclusive com praia paradisíaca e atividades aquáticas",
    price: 5200.00,
    duration: 5,
    destination: "Cancún, México",
    
    components: {
      // Voo
      flight: {
        id: 201,
        type: "flight",
        name: "Voo São Paulo - Cancún (Aeroméxico)",
        description: "Voo com 1 escala classe econômica",
        price: 2200.00,
        details: {
          departure: "GRU - São Paulo",
          arrival: "CUN - Cancún",
          airline: "Aeroméxico",
          flightClass: "Econômica",
          stops: 1
        }
      },
      
      // Hotel
      hotel: {
        id: 202,
        type: "hotel",
        name: "Resort Moon Palace Cancún",
        description: "Resort all inclusive 5 estrelas na praia",
        price: 2400.00,
        details: {
          stars: 5,
          nights: 4,
          roomType: "Quarto Vista Mar",
          allInclusive: true,
          breakfast: true,
          lunch: true,
          dinner: true
        }
      },
      
      // Passeio 1
      tour1: {
        id: 203,
        type: "tour",
        name: "Mergulho em Cenote",
        description: "Experiência única de mergulho em cenote natural",
        price: 280.00,
        details: {
          duration: "4 horas",
          includes: "Equipamento + Instrutor + Transporte"
        }
      },
      
      // Passeio 2
      tour2: {
        id: 204,
        type: "tour",
        name: "Ruínas de Chichén Itzá",
        description: "Tour guiado pela maravilha do mundo",
        price: 320.00,
        details: {
          duration: "8 horas",
          guide: "Português/Espanhol",
          includes: "Transporte + Almoço + Guia"
        }
      }
    }
  },
  
  {
    // ============================================
    // PACOTE 3: Aventura na Patagônia
    // ID: 3
    // ============================================
    id: 3,
    name: "Patagônia Selvagem - 10 dias",
    description: "Expedição completa pela Patagônia Argentina e Chilena",
    price: 12500.00,
    duration: 10,
    destination: "Patagônia, Argentina/Chile",
    
    components: {
      // Voo
      flight: {
        id: 301,
        type: "flight",
        name: "Voo São Paulo - El Calafate (LATAM)",
        description: "Voo com conexão em Buenos Aires",
        price: 3800.00,
        details: {
          departure: "GRU - São Paulo",
          arrival: "FTE - El Calafate",
          airline: "LATAM",
          flightClass: "Econômica Premium",
          stops: 1
        }
      },
      
      // Hotel 1
      hotel1: {
        id: 302,
        type: "hotel",
        name: "Hotel Xelena - El Calafate",
        description: "Hotel boutique com vista para o lago",
        price: 2100.00,
        details: {
          stars: 4,
          nights: 3,
          roomType: "Quarto Superior",
          breakfast: true
        }
      },
      
      // Hotel 2
      hotel2: {
        id: 303,
        type: "hotel",
        name: "Explora Patagonia - Torres del Paine",
        description: "Lodge exclusivo no parque nacional",
        price: 4200.00,
        details: {
          stars: 5,
          nights: 4,
          roomType: "Suite Explorer",
          allInclusive: true
        }
      },
      
      // Passeio 1
      tour1: {
        id: 304,
        type: "tour",
        name: "Trekking Glaciar Perito Moreno",
        description: "Caminhada sobre o glaciar com crampons",
        price: 650.00,
        details: {
          duration: "6 horas",
          difficulty: "Moderada",
          includes: "Equipamento + Guia + Transporte"
        }
      },
      
      // Passeio 2
      tour2: {
        id: 305,
        type: "tour",
        name: "Circuito W - Torres del Paine",
        description: "Trekking de 3 dias pelo circuito W",
        price: 1200.00,
        details: {
          duration: "3 dias",
          difficulty: "Alta",
          includes: "Guia + Camping + Alimentação"
        }
      },
      
      // Seguro
      insurance: {
        id: 306,
        type: "insurance",
        name: "Seguro Viagem Aventura",
        description: "Cobertura para atividades de aventura",
        price: 550.00,
        details: {
          coverage: "USD 150.000",
          includes: "Médico, resgate, equipamentos"
        }
      }
    }
  },
  
  {
    // ============================================
    // PACOTE 4: Relax em Maldivas
    // ID: 4
    // ============================================
    id: 4,
    name: "Maldivas Paradisíacas - 8 dias",
    description: "Bangalô sobre a água em resort exclusivo",
    price: 18900.00,
    duration: 8,
    destination: "Maldivas",
    
    components: {
      // Voo
      flight: {
        id: 401,
        type: "flight",
        name: "Voo São Paulo - Malé (Emirates)",
        description: "Voo com conexão em Dubai - Classe Executiva",
        price: 9500.00,
        details: {
          departure: "GRU - São Paulo",
          arrival: "MLE - Malé",
          airline: "Emirates",
          flightClass: "Executiva",
          stops: 1
        }
      },
      
      // Transfer
      transfer: {
        id: 402,
        type: "transfer",
        name: "Transfer Hidroavião",
        description: "Transfer do aeroporto ao resort de hidroavião",
        price: 800.00,
        details: {
          type: "Hidroavião",
          duration: "45 minutos",
          roundTrip: true
        }
      },
      
      // Hotel
      hotel: {
        id: 403,
        type: "hotel",
        name: "Conrad Maldives Rangali Island",
        description: "Bangalô sobre a água com piscina privativa",
        price: 7800.00,
        details: {
          stars: 5,
          nights: 7,
          roomType: "Water Villa com Piscina",
          allInclusive: false,
          breakfast: true
        }
      },
      
      // Passeio 1
      tour1: {
        id: 404,
        type: "tour",
        name: "Mergulho com Tubarões Baleia",
        description: "Experiência única de mergulho",
        price: 450.00,
        details: {
          duration: "4 horas",
          includes: "Equipamento + Instrutor + Barco"
        }
      },
      
      // Spa
      spa: {
        id: 405,
        type: "spa",
        name: "Pacote Spa Relaxante",
        description: "3 sessões de massagem e tratamentos",
        price: 350.00,
        details: {
          sessions: 3,
          includes: "Massagem + Facial + Aromaterapia"
        }
      }
    }
  },
  
  {
    // ============================================
    // PACOTE 5: Cultura no Japão
    // ID: 5
    // ============================================
    id: 5,
    name: "Japão Cultural - 12 dias",
    description: "Roteiro completo por Tóquio, Kyoto e Osaka",
    price: 15800.00,
    duration: 12,
    destination: "Japão",
    
    components: {
      // Voo
      flight: {
        id: 501,
        type: "flight",
        name: "Voo São Paulo - Tóquio (ANA)",
        description: "Voo direto classe econômica premium",
        price: 6200.00,
        details: {
          departure: "GRU - São Paulo",
          arrival: "NRT - Tóquio",
          airline: "ANA",
          flightClass: "Premium Economy"
        }
      },
      
      // Hotel 1
      hotel1: {
        id: 502,
        type: "hotel",
        name: "Hotel Gracery Shinjuku - Tóquio",
        description: "Hotel moderno no centro de Tóquio",
        price: 2400.00,
        details: {
          stars: 4,
          nights: 5,
          roomType: "Quarto Superior",
          breakfast: true
        }
      },
      
      // Hotel 2
      hotel2: {
        id: 503,
        type: "hotel",
        name: "Ryokan Tradicional - Kyoto",
        description: "Hospedagem tradicional japonesa",
        price: 1800.00,
        details: {
          stars: 4,
          nights: 4,
          roomType: "Quarto Tatami",
          breakfast: true,
          dinner: true,
          onsen: true
        }
      },
      
      // JR Pass
      transport: {
        id: 504,
        type: "transport",
        name: "JR Pass 7 dias",
        description: "Passe ilimitado de trem bala",
        price: 1600.00,
        details: {
          validity: "7 dias",
          includes: "Shinkansen + Trens JR ilimitados"
        }
      },
      
      // Passeio 1
      tour1: {
        id: 505,
        type: "tour",
        name: "Tour Templos de Kyoto",
        description: "Visita aos principais templos históricos",
        price: 380.00,
        details: {
          duration: "8 horas",
          guide: "Português",
          includes: "Transporte + Guia + Ingressos"
        }
      },
      
      // Passeio 2
      tour2: {
        id: 506,
        type: "tour",
        name: "Experiência Gueixa",
        description: "Jantar tradicional com apresentação de gueixa",
        price: 520.00,
        details: {
          duration: "3 horas",
          includes: "Jantar kaiseki + Apresentação"
        }
      },
      
      // Passeio 3
      tour3: {
        id: 507,
        type: "tour",
        name: "Monte Fuji e Hakone",
        description: "Excursão de dia inteiro",
        price: 450.00,
        details: {
          duration: "10 horas",
          includes: "Transporte + Almoço + Guia"
        }
      },
      
      // Seguro
      insurance: {
        id: 508,
        type: "insurance",
        name: "Seguro Viagem Ásia",
        description: "Cobertura completa para 12 dias",
        price: 450.00,
        details: {
          coverage: "USD 80.000",
          includes: "Médico, bagagem, cancelamento"
        }
      }
    }
  }
];

/**
 * RESUMO DOS PACOTES:
 * 
 * PACOTE 1 (ID: 1) - Paris Romântico
 * - 5 componentes: voo (101), hotel (102), 2 tours (103, 104), seguro (105)
 * 
 * PACOTE 2 (ID: 2) - Cancún All Inclusive
 * - 4 componentes: voo (201), hotel (202), 2 tours (203, 204)
 * 
 * PACOTE 3 (ID: 3) - Patagônia Selvagem
 * - 6 componentes: voo (301), 2 hotéis (302, 303), 2 tours (304, 305), seguro (306)
 * 
 * PACOTE 4 (ID: 4) - Maldivas Paradisíacas
 * - 5 componentes: voo (401), transfer (402), hotel (403), tour (404), spa (405)
 * 
 * PACOTE 5 (ID: 5) - Japão Cultural
 * - 8 componentes: voo (501), 2 hotéis (502, 503), transporte (504), 3 tours (505, 506, 507), seguro (508)
 */

// Função helper para buscar pacote por ID
export const getPackageById = (id) => {
  return testPackages.find(pkg => pkg.id === id);
};

// Função helper para buscar componente por ID
export const getComponentById = (componentId) => {
  for (const pkg of testPackages) {
    for (const [key, component] of Object.entries(pkg.components)) {
      if (component.id === componentId) {
        return { ...component, packageId: pkg.id, packageName: pkg.name };
      }
    }
  }
  return null;
};

// Função helper para listar todos os componentes de um tipo específico
export const getComponentsByType = (type) => {
  const components = [];
  for (const pkg of testPackages) {
    for (const [key, component] of Object.entries(pkg.components)) {
      if (component.type === type) {
        components.push({ ...component, packageId: pkg.id, packageName: pkg.name });
      }
    }
  }
  return components;
};
