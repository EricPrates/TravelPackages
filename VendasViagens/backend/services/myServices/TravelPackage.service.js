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
export const createdPackageWithOptions = async (req, res) => {
    try {
        const { title, destination, origin, departureDate, returnDate,
            description, availableSlots, agentId, images, checkin, checkout } = req.body;

        const travelPackage = await TravelPackage.create({
            title,
            destination,
            origin,
            departureDate,
            returnDate,
            description,
            availableSlots,
            agentId,
            images: images || [],
        });
        const formattedDepartureDate = new Date(departureDate).toISOString().split('T')[0];
        const formattedReturnDate = new Date(returnDate).toISOString().split('T')[0];
        const formattedCheckin = checkin ? new Date(checkin).toISOString().split('T')[0] : null;
        const formattedCheckout = checkout ? new Date(checkout).toISOString().split('T')[0] : null;
        const [flights, hotels, activities, carRentals] = await Promise.all([
            amadeusClient.searchFlights({ origin, destination, departureDate: formattedDepartureDate, returnDate: formattedReturnDate }),
            amadeusClient.searchHotels({ destination, checkin: formattedCheckin, checkout: formattedCheckout }),
            amadeusClient.searchActivities({ destination }),
            amadeusClient.searchCarRentals({ destination, departureDate: formattedDepartureDate, returnDate: formattedReturnDate }),
        ]);
        res.status(201).json({
            success: true,
            travelPackage: {
                id: travelPackage.id, // ✅ ID disponível
                title: travelPackage.title,
                destination: travelPackage.destination,
                origin: travelPackage.origin,
                departureDate: travelPackage.departureDate,
                returnDate: travelPackage.returnDate,
                availableSlots: travelPackage.availableSlots,
                agentId: travelPackage.agentId
            },
            availableOptions: {
                flights: flights || [],
                hotels: hotels || [],
                activities: activities || [],
                carRentals: carRentals || [],
            },
            message: 'Pacote criado com opções disponíveis'
        });

    } catch (error) {
        console.error('Erro em createdPackageWithOptions:', error);
        res.status(500).json({
            success: false,
            error: error.message || "Erro ao criar pacote de viagem com opções"
        });
    }
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
export const createPackageWithSelectedComponents = async (req, res) => {

    try {
        const { packageId } = req.params;
        const { selectedFlight, selectedHotel, selectedActivities, selectedCarRental } = req.body;

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
        if(selectedCarRental) {
            const carComponent = await PackageComponents.create({
                name: `Carro: ${selectedCarRental.vehicle?.name || 'Carro Alugado'}`,
                description: `Aluguel de carro de ${selectedCarRental.pickUpDate} a ${selectedCarRental.dropOffDate}`,
                type: 'CAR_RENTAL',
                moneyPrice: selectedCarRental.moneyPrice,
                milesPrice: selectedCarRental.milesPrice,
                packageId: packageId,
                amadeusId: selectedCarRental.id,
                departureDate: selectedCarRental.pickUpDate,
                returnDate: selectedCarRental.dropOffDate
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
            res.status(204);
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
            res.status(204);
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