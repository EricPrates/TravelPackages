import db from '../../models/index.js';
import { amadeusClient } from '../amadeusServices/AmadeusClient.Service.js';
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;



export const fetchOptions = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; 
        const travelPackage = await TravelPackage.findByPk(id);
        if (!travelPackage) return res.status(404).json({ success: false, message: 'Pacote não encontrado' });

        if (type) {
            const ALLOWED = ['FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'];
            if (!ALLOWED.includes(type)) {
                return res.status(400).json({ success: false, message: 'Type inválido. Use FLIGHT|HOTEL|ACTIVITY|CAR_RENTAL' });
            }
            const options = await amadeusClient.fetchOptionsByType(travelPackage, type);
            return res.status(200).json({ success: true, type, options });
        }

        const options = await amadeusClient.fetchAmadeusOptionsAsync(travelPackage);
        return res.status(200).json({ success: true, options });
    } catch (error) {
        console.error('Erro em fetchOptions:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erro ao buscar opções' });
    }
};

export const addPackageComponent = async (req, res) => {
    try {
        const packageId = req.params.id; 
        const { type, component } = req.body;

        const travelPackage = await TravelPackage.findByPk(packageId);
        if (!travelPackage) return res.status(404).json({ success: false, message: 'Pacote não encontrado' });

        const ALLOWED = ['FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'];
        if (!type || !ALLOWED.includes(type)) {
            return res.status(400).json({ success: false, message: 'Type inválido. Use FLIGHT|HOTEL|ACTIVITY|CAR_RENTAL' });
        }
        if (!component || typeof component !== 'object') {
            return res.status(400).json({ success: false, message: 'component é obrigatório no body' });
        }

     
        const payload = {
            packageId,
            type,
            name: component.name || component.title || `${type} component`,
            description: component.description || null,
            amadeusId: component.id || component.amadeusId || null,
            moneyPrice: Number(component.moneyPrice ?? 0),
            milesPrice: Number(component.milesPrice ?? 0),
            checkin: component.checkin ? component.checkin : null,
            checkout: component.checkout ? component.checkout : null,
            departureDate: component.departureDate ? component.departureDate : null,
            returnDate: component.returnDate ? component.returnDate : null
        };


        if (type === 'FLIGHT') {
            payload.moneyPrice = component.moneyPrice || 0;
            payload.milesPrice = component.milesPrice || 0;
            payload.origin = component.origin;
            payload.destination = component.destination;
            payload.departureDate = component.departureDate;
            payload.returnDate = component.returnDate;
            payload.numberOfTravelers = component.numberOfTravelers? component.numberOfTravelers: 1;
        } else if (type === 'HOTEL') {
            payload.moneyPrice = component.moneyPrice || 0;
            payload.milesPrice = component.milesPrice || 0;
            payload.checkin = component.checkin || null;
            payload.checkout = component.checkout || null;
        } else if (type === 'CAR_RENTAL') {
            payload.moneyPrice = component.moneyPrice || 0;
            payload.milesPrice = component.milesPrice || 0;
            payload.checkin =  component.checkin || null;
            payload.checkout =  component.checkout || null;
        }

        const created = await PackageComponents.create(payload);


        const comps = await PackageComponents.findAll({ where: { packageId } });
        const totalPrice = comps.reduce((s, c) => s + (c.moneyPrice || 0), 0);
        const totalMiles = comps.reduce((s, c) => s + (c.milesPrice || 0), 0);

        return res.status(201).json({
            success: true,
            component: {
                id: created.id,
                type: created.type,
                name: created.name,
                moneyPrice: created.moneyPrice,
                milesPrice: created.milesPrice
            },
            totals: { totalPrice, totalMiles }
        });
    } catch (error) {
        console.error('Erro em addPackageComponent:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erro ao adicionar componente' });
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
    const { name, destination, origin, departureDate, returnDate, numberOfTravelers } = data;

  
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