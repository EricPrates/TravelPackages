import db from '../../models/index.js';
import { amadeusClient } from '../amadeusServices/AmadeusClient.Service.js';
const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export const findAll = async (req, res) => {
    try {
        const data = await TravelPackage.findAll({
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'name', 'description', 'price'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                    through: { attributes: [] },
                },
            ],
            attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
        })

        if (data) {
            res.status(200).send(data)

        } else {
            res.status(404).send({
                message: `Não foi possível encontrar pacotes de viagem.`
            })
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Erro ao buscar pacotes de viagem"
        })
    }
};



export const createBasePackage = async (req, res) => {
    try {

        const packageData = req.body;
            const validationError = validatePackageData(packageData);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const travelPackage = await createPackageInDB(packageData);

        
        fetchAmadeusOptionsAsync(travelPackage);

        res.status(201).json({
            success: true,
            travelPackage: formatPackageResponse(travelPackage),
            message: 'Pacote base criado com sucesso. Buscando opções...'
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
    const { title, destination, origin, departureDate, returnDate, numberOfTravelers } = data;

  
    const requiredFields = ['title', 'destination', 'origin', 'departureDate', 'returnDate', 'numberOfTravelers'];
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


    if (numberOfTravelers <= 0) {
        return {
            success: false,
            message: "Número de viajantes deve ser maior que zero"
        };
    }

    return null; 
};

export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date > new Date();
};

export const createPackageInDB = async (packageData) => {
    const { 
        title, destination, origin, departureDate, returnDate,
        description, availableSlots, agentId, images, numberOfTravelers 
    } = packageData;

    return await TravelPackage.create({
        title,
        destination,
        origin,
        departureDate,
        returnDate,
        description,
        availableSlots,
        agentId: agentId,
        images: images || [],
        numberOfTravelers
    });
};

export const findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await TravelPackage.findByPk(id, {
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'name', 'description', 'price'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                    through: { attributes: [] },
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
export const addPackageComponents = async (req, res) => {

    try {
        const { packageId } = req.params;
        const { selectedFlight, selectedHotel, selectedActivities, selectedCarRental } = req.body;
        if (selectedActivities.checkInDate || selectedActivities.checkOutDate) {
            res.status(400).json({
                success: false,
                message: "As datas de check-in e check-out não são necessárias para atividades."
            });
            return;
        }
        if (selectedFlight.numberOfTravelers <= 0) {
            res.status(400).json({
                success: false,
                message: "O número de viajantes deve ser maior que zero."
            });
            return;
        }
        const savedComponents = [];
        if (selectedFlight) {
            const airline = selectedFlight.validatingAirlineCodes?.[0] || 'Airline';
            const flightNumber = selectedFlight.itineraries?.[0]?.segments?.[0]?.number || 'N/A';
            const origin = selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || selectedFlight.origin;
            const destination = selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode || selectedFlight.destination;
            const departureDate = selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at || selectedFlight.departureDate;
            await PackageComponents.create({
                name: `Voo: ${airline} - ${flightNumber}`,
                description: `Voo de ${origin} para ${destination} em ${departureDate}`,
                type: 'FLIGHT',
                moneyPrice: selectedFlight.moneyPrice,
                packageId: packageId,
                milesPrice: selectedFlight.milesPrice,
                departureDate: departureDate,
                returnDate: selectedFlight.returnDate,
                origin: origin,
                destination: destination,
                numberOfTravelers: selectedFlight.numberOfTravelers,
                amadeusId: selectedFlight.id,
            });
            savedComponents.push(selectedFlight);
        }
        if (selectedHotel) {
            const hotelName = selectedHotel.hotel?.name || 'Hotel';
            const amadeusId = selectedHotel.hotel?.hotelId || selectedHotel.amadeusId || null;
            const checkInDate = selectedHotel.checkInDate || selectedHotel.checkin;
            const checkOutDate = selectedHotel.checkOutDate || selectedHotel.checkout;
            const hotelComponent = await PackageComponents.create({
                name: `Hotel: ${hotelName || 'Hotel'}`,
                description: `Estadia de ${checkInDate} a ${checkOutDate} em ${hotelName || 'Hotel'}`,
                type: 'HOTEL',
                moneyPrice: selectedHotel.moneyPrice,
                milesPrice: selectedHotel.milesPrice,
                packageId: packageId,
                checkin: checkInDate,
                checkout: checkOutDate,
                amadeusId: amadeusId,
            });
            savedComponents.push(hotelComponent);
        }
        if (selectedActivities && Array.isArray(selectedActivities)) {
            const activityPromises = selectedActivities.map(async (activity) => {
                const activityName = activity.name || 'Atividade';
                const amadeusId = activity.id || activity.amadeusId || null;
                await PackageComponents.create({
                    name: `Atividade: ${activityName}`,
                    description: `Atividade em ${activityName}`,
                    type: 'ACTIVITY',
                    moneyPrice: activity.moneyPrice,
                    milesPrice: activity.milesPrice,
                    packageId: packageId,
                    amadeusId: amadeusId,
                });

            });
            const createdActivities = await Promise.all(activityPromises);
            savedComponents.push(...createdActivities);
        }
        if (selectedCarRental) {
            const carComponent = await PackageComponents.create({
                name: `Carro: ${selectedCarRental.vehicle?.name || 'Carro Alugado'}`,
                description: `Aluguel de carro de ${selectedCarRental.checkInDate} a ${selectedCarRental.checkOutDate}`,
                type: 'CAR_RENTAL',
                moneyPrice: selectedCarRental.moneyPrice,
                milesPrice: selectedCarRental.milesPrice,
                packageId: packageId,
                amadeusId: selectedCarRental.id,
                departureDate: selectedCarRental.checkin,
                returnDate: selectedCarRental.checkout
            });
            savedComponents.push(carComponent);
        }
        res.status(201).json({
            success: true,
            message: 'Componentes adicionados ao pacote com sucesso!',
            packageId: packageId,
            savedComponents: savedComponents.map(comp => ({
                id: comp.id,
                type: comp.type,
                name: comp.name,
                moneyPrice: comp.moneyPrice
            })),
            totalPrice: savedComponents.reduce((total, comp) => total + comp.moneyPrice, 0),
            totalMiles: savedComponents.reduce((total, comp) => total + comp.milesPrice, 0)
        });

    } catch (error) {
        console.error('Erro em createPackageWithSelectedComponents:', error);
        res.status(500).json({
            success: false,
            error: error.message || "Erro ao adicionar componentes ao pacote"
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