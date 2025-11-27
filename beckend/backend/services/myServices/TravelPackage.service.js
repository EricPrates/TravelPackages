import db from '../../models/index.js';
import { travelDataService } from '../TravelData.Service.js';

const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export const fetchOptions = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, page, limit } = req.query; 
        const travelPackage = await TravelPackage.findByPk(id);
        if (!travelPackage) return res.status(404).json({ success: false, message: 'Pacote não encontrado' });
        
        const offset = (parseInt(page) - 1) * (limit ? parseInt(limit) : 10);
        const formatDate = (date) => {
            if (!date) return null;
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        };

    
        if (type) {
            const ALLOWED = ['FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'];
            if (!ALLOWED.includes(type)) {
                return res.status(400).json({ success: false, message: 'Type inválido. Use FLIGHT|HOTEL|ACTIVITY|CAR_RENTAL' });
            }

            let options = [];
            switch (type) {
                case 'FLIGHT':
                    options = await travelDataService.searchFlights({
                       
                        origin: travelPackage.origin,
                        destination: travelPackage.destination,
                        departureDate: formatDate(travelPackage.departureDate),
                        returnDate: formatDate(travelPackage.returnDate),
                        numberOfTravelers: travelPackage.numberOfTravelers || 1
                    });
                    break;
                case 'HOTEL':
                    options = await travelDataService.searchHotels({
                        destination: travelPackage.destination,
                        checkin: formatDate(travelPackage.departureDate),
                        checkout: formatDate(travelPackage.returnDate),
                        numberOfTravelers: travelPackage.numberOfTravelers || 1
                    });
                    break;
                case 'ACTIVITY':
                    options = await travelDataService.searchActivities({
                        destination: travelPackage.destination
                    });
                    break;
                case 'CAR_RENTAL':
                    options = await travelDataService.searchCarRentals({
                        destination: travelPackage.destination,
                        checkin: formatDate(travelPackage.departureDate),
                        checkout: formatDate(travelPackage.returnDate)
                    });
                    break;
            }


            const totalItems = options.length;
            const totalPages = Math.ceil(totalItems / limit);
            const paginatedOptions = options.slice(offset, offset + parseInt(limit));
            return res.status(200).json({ 
               success: true, 
                type, 
                options: paginatedOptions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
            }});
        }

   
        const options = await travelDataService.searchAllOptions({
            origin: travelPackage.origin,
            destination: travelPackage.destination,
            departureDate: formatDate(travelPackage.departureDate),
            returnDate: formatDate(travelPackage.returnDate),
            checkin: formatDate(travelPackage.departureDate),
            checkout: formatDate(travelPackage.returnDate),
            numberOfTravelers: travelPackage.numberOfTravelers || 1
        });

        const maxLimit = parseInt(limit);

        return res.status(200).json({ 
            success: true, 
            options: {
                flights: options.flights.slice(0, maxLimit),
                hotels: options.hotels.slice(0, maxLimit),
                activities: options.activities.slice(0, maxLimit),
                carRentals: options.cars.slice(0, maxLimit)
            },
            summary: {
                totalFlights: options.flights.length,
                totalHotels: options.hotels.length,
                totalActivities: options.activities.length,
                totalCars: options.cars.length,
                showingLimit: maxLimit
            }
        });
    } catch (error) {
        console.error('Erro em fetchOptions:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erro ao buscar opções' });
    }
};


export const findAll = async (req, res) => {
    console.log('🔵 findAll chamado');
    try {
        console.log('🔵 Buscando pacotes...');
        const data = await TravelPackage.findAll({
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'title', 'name', 'description', 'type', 'moneyPrice', 'milesPrice'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                },
            ],
        });
        console.log('🔵 Pacotes encontrados:', data.length);
        console.log('🔵 Enviando resposta...');
        res.status(200).json({
            success: true,
            data: data
        });
        console.log('✅ Resposta enviada');
    } catch (error) {
        console.error('❌ Erro ao buscar pacotes:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao buscar pacotes de viagem"
        });
    }
};

export const createBasePackage = async (req, res) => {
    try {
        const {id, destination, origin, departureDate, returnDate} = req.body
        if(returnDate < departureDate){
            return res.status(400).json({
                success: false,
                message: "A data de retorno não pode ser anterior à data de partida."
            });
        }
      
        if (!id ) {
            return res.status(401).json({
                success: false,
                message: "Usuário não autenticado"
            });
        }
        if (!destination || !origin) {
            return res.status(400).json({
                success: false,
                message: "Os campos destino e origem são obrigatórios."
            });
        }
        
   

        const validationError = validatePackageData({ destination, origin });
        if (validationError) {
            return res.status(400).json(validationError);
        }


        const travelPackage = await create({
            ...packageData,
            agentId: agentId,
            destination: packageData.destination,
        });

        res.status(201).json({
            success: true,
            package: travelPackage
        });
    } catch (error) {
        console.error('Erro em createBasePackage:', error);
        res.status(500).json({
            success: false,
            error: "Erro ao criar pacote de viagem"
        });
    }
};

export const validatePackageData = (data) => {

    const { title, destination, origin, departureDate, returnDate } = data;

    const requiredFields = ['destination', 'origin', 'departureDate', 'returnDate'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        return {
            success: false,
            message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
        };
    }

    if (!isValidDate(departureDate) || !isValidDate(returnDate)) {
        return {
            success: false,
            message: "Digite datas válidas"
        };
    }

    

    return null; 
};

export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date > new Date();
};




export const findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await TravelPackage.findByPk(id, {
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'title', 'name', 'description', 'type', 'moneyPrice', 'milesPrice'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                },
            ],
            attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
        });

        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send({
                message: `Pacote de viagem não encontrado.`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Erro ao buscar pacote de viagem"
        });
    }
};

export const update = async (req, res) => {
    const travelPackageId = req.params.id;
    if (!req.body.title) {
        res.status(400).send({
            message: "Dados são obrigatórios para atualização."
        })
        return;
    }
    try {
        const [updated] = await TravelPackage.update(req.body, {
            where: { id: travelPackageId }
        });
        if (updated === 1) {
            const updatedTravelPackage = await TravelPackage.findByPk(travelPackageId);
            res.status(200).send(updatedTravelPackage);
        } else {
            res.status(404).send({
                message: "Pacote de viagem não encontrado."
            });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Erro ao atualizar pacote de viagem"
        });
    }
};

export const remove = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await TravelPackage.destroy({
            where: { id: id }
        });

        if (deleted == 1) {
            res.sendStatus(204);
        } else {
            res.status(404).send({
                message: `Não foi possível encontrar o pacote de viagem com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "Erro ao deletar o pacote de viagem com id=" + id
        })
    }
};