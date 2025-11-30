import db from '../../models/index.js';
import { travelDataService } from '../TravelData.Service.js';

const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export const fetchOptions = async (req, res) => {
    try {
        const { packageId } = req.params;
        const id = packageId;
        const { type } = req.query;
        
      
        const travelPackage = await TravelPackage.findByPk(id);
        if (!travelPackage) return res.status(404).json({ success: false, message: 'Pacote não encontrado' });
        
        const formatDate = (date) => {
            if (!date) return null;
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        };

        if (type) {
            const ALLOWED = ['FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'];
            if (!ALLOWED.includes(type.toUpperCase())) {
                return res.status(400).json({ success: false, message: 'Type inválido. Use FLIGHT|HOTEL|ACTIVITY|CAR_RENTAL' });
            }

            let options = [];
            const typeUpper = type.toUpperCase();
            console.log('   Entrando no switch com:', typeUpper);
            
            switch (typeUpper) {
                case 'FLIGHT':
                    console.log('   ✈️ Buscando FLIGHTS...');
                    options = await travelDataService.searchFlights({
                        origin: travelPackage.origin,
                        destination: travelPackage.destination,
                        departureDate: formatDate(travelPackage.departureDate),
                        returnDate: formatDate(travelPackage.returnDate),
                        numberOfTravelers: travelPackage.numberOfTravelers || 1
                    });
                    console.log('   ✈️ Flights encontrados:', options?.length || 0);
                    break;
                case 'HOTEL':
                    console.log('   🏨 Buscando HOTELS...');
                    options = await travelDataService.searchHotels({
                        destination: travelPackage.destination,
                        checkin: formatDate(travelPackage.departureDate),
                        checkout: formatDate(travelPackage.returnDate),
                        numberOfTravelers: travelPackage.numberOfTravelers || 1
                    });
                    console.log('   🏨 Hotels encontrados:', options?.length || 0);
                    break;
                case 'ACTIVITY':
                    console.log('   🎯 Buscando ACTIVITIES...');
                    options = await travelDataService.searchActivities({
                        destination: travelPackage.destination
                    });
                    console.log('   🎯 Activities encontradas:', options?.length || 0);
                    break;
                case 'CAR_RENTAL':
                    console.log('   🚗 Buscando CAR_RENTALS...');
                    options = await travelDataService.searchCarRentals({
                        destination: travelPackage.destination,
                        checkin: formatDate(travelPackage.departureDate),
                        checkout: formatDate(travelPackage.returnDate)
                    });
                    console.log('   🚗 Cars encontrados:', options?.length || 0);
                    break;
            }

            console.log('   📦 Retornando', options?.length || 0, 'opções do tipo', typeUpper);
            
            return res.status(200).json({ 
                success: true, 
                type: typeUpper, 
                options: options
            });
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

        return res.status(200).json({ 
            success: true, 
            options: {
                flights: options.flights,
                hotels: options.hotels,
                activities: options.activities,
                carRentals: options.cars
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
                    attributes: ['id', 'name', 'description', 'type', 'moneyPrice', 'milesPrice'],
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
        
        const { 
            title, 
            destination, 
            origin, 
            departureDate, 
            returnDate, 
            description, 
            numberOfTravelers 
        } = req.body;
        
        const agentId = req.user.id;
        

        if (!agentId) {
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

        if (!departureDate || !returnDate) {
            return res.status(400).json({
                success: false,
                message: "As datas de partida e retorno são obrigatórias."
            });
        }

        if (new Date(returnDate) < new Date(departureDate)) {
            return res.status(400).json({
                success: false,
                message: "A data de retorno não pode ser anterior à data de partida."
            });
        }

        const validationError = validatePackageData({ 
            destination, 
            origin, 
            departureDate, 
            returnDate 
        });
        
        if (validationError) {
            return res.status(400).json(validationError);
        }

      
        const travelPackage = await TravelPackage.create({
            agentId,
            title: title || `${origin} para ${destination}`,
            destination,
            origin,
            departureDate,
            returnDate,
            description: description || '',
            numberOfTravelers: numberOfTravelers || 1,
            availableSlots: numberOfTravelers || 1,
            totalMoneyPrice: 0,
            totalMilesPrice: 0,
            status: 'AVAILABLE'
        });

        res.status(201).json({
            success: true,
            data: travelPackage
        });
    } catch (error) {
        console.error('Erro em createBasePackage:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar pacote de viagem",
            error: error.message
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
        const id = req.params.packageId;
        const data = await TravelPackage.findByPk(id, {
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'name', 'description', 'type', 'moneyPrice', 'milesPrice'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                },
            ],
            attributes: ['id', 'title', 'description', 'destination', 'origin', 'departureDate', 'returnDate', 'availableSlots', 'totalMoneyPrice', 'totalMilesPrice', 'status', 'images'],
        });

        if (data) {
            res.status(200).json({ success: true, data });
        } else {
            res.status(404).json({
                success: false,
                message: `Pacote de viagem não encontrado.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao buscar pacote de viagem"
        });
    }
};

export const update = async (req, res) => {
    const travelPackageId = req.params.packageId;
    
    try {
        console.log('🔵 Atualizando pacote:', travelPackageId);
        console.log('📦 Dados recebidos:', req.body);
        
        const [updated] = await TravelPackage.update(req.body, {
            where: { id: travelPackageId }
        });
        
        console.log('✅ Linhas atualizadas:', updated);
        
        if (updated === 1) {
            const updatedTravelPackage = await TravelPackage.findByPk(travelPackageId);
            console.log('✅ Pacote atualizado:', updatedTravelPackage.title);
            res.status(200).json({ success: true, data: updatedTravelPackage });
        } else {
            console.log('❌ Pacote não encontrado');
            res.status(404).json({
                success: false,
                message: "Pacote de viagem não encontrado."
            });
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao atualizar pacote de viagem"
        });
    }
};

export const remove = async (req, res) => {
    const id = req.params.packageId;
    try {
        console.log('🗑️ Deletando pacote:', id);
        
        // Verificar se o pacote existe
        const travelPackage = await TravelPackage.findByPk(id);
        if (!travelPackage) {
            return res.status(404).json({
                success: false,
                message: `Pacote de viagem com id=${id} não encontrado.`
            });
        }

        // Deletar componentes relacionados primeiro
        await PackageComponents.destroy({
            where: { packageId: id }
        });
        console.log('✅ Componentes deletados');

        // Agora deletar o pacote
        const deleted = await TravelPackage.destroy({
            where: { id: id }
        });

        console.log('✅ Pacote deletado');

        res.status(200).json({ 
            success: true, 
            message: "Pacote e seus componentes deletados com sucesso" 
        });

    } catch (error) {
        console.error('❌ Erro ao deletar:', error);
        
        // Mensagem específica para constraint de compras
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Não é possível deletar este pacote pois existem compras associadas a ele."
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao deletar o pacote de viagem"
        });
    }
};