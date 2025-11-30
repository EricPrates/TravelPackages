import db from "../../../models/index.js";

const Op = db.Sequelize.Op;
const PackageComponents = db.PackageComponents;
const TravelPackage = db.TravelPackage;

export const findByType = async (req, res) => {
    const type = req.params.type;
    try {
        const data = await PackageComponents.findAll({
            where: {
                type: {
                    [Op.iLike]: `%${type}%`
                }
            }
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componente de pacote com tipo=" + type
        });
    }
};

export const findByPk = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await PackageComponents.findByPk(id);
        if (data) {
            res.status(200).json({ success: true, data });
        } else {
            res.status(404).json({
                success: false,
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componente de pacote com id=" + id
        });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.body.type) {
            return res.status(400).json({
                success: false,
                message: "O tipo não pode estar vazio!"
            });
        }
        const data = await PackageComponents.create({
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
        });
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao criar componente de pacote"
        });
    }
};

export const updatePackageTotals = async (packageId, transaction = null) => {
    const components = await PackageComponents.findAll({
        where: { packageId },
        ...(transaction && { transaction })
    });
    
    const totalMoneyPrice = components.reduce((sum, comp) => sum + Number(comp.moneyPrice || 0), 0);
    const totalMilesPrice = components.reduce((sum, comp) => sum + Number(comp.milesPrice || 0), 0);
    
    await TravelPackage.update({
        totalMoneyPrice,
        totalMilesPrice
    }, {
        where: { id: packageId },
        ...(transaction && { transaction })
    });
    
    return { totalMoneyPrice, totalMilesPrice };
};

export const update = async (req, res) => {
    const id = req.params.id;
    try {
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).json({
                success: false,
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const [updated] = await PackageComponents.update(req.body, {
            where: { id: id }
        });

        const updatedComponent = await PackageComponents.findByPk(id);
        res.status(200).json({ success: true, data: updatedComponent });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar componente de pacote com id=" + id
        });
    }
};

export const remove = async (req, res) => {
    const id = req.params.id;
    try {
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).json({
                success: false,
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const deleted = await PackageComponents.destroy({
            where: { id: id }
        });
        if (deleted == 1) {
            res.status(200).json({ success: true, message: "Componente deletado com sucesso" });
        } else {
            res.status(404).json({
                success: false,
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao deletar componente de pacote com id=" + id
        });
    }
};

export const findAllWithPackages = async (req, res) => {
    try {
        const data = await PackageComponents.findAll({
            include: [
                {
                    model: TravelPackage, as: 'travelPackage',
                    attributes: ['id', 'title', 'destination', 'origin', 'departureDate', 'returnDate'],
                }
            ]
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componentes de pacotes com pacotes associados."
        });
    }
};

export const createFlightComponent = async (componentData, transaction = null) => {
    console.log('✈️ Criando componente de voo:', componentData);
    
    // Extrair dados do formato Amadeus
    const origin = componentData.departure?.iataCode || componentData.origin;
    const destination = componentData.arrival?.iataCode || componentData.destination;
    const departureDate = componentData.departure?.at || componentData.departureDate;
    const returnDate = componentData.arrival?.at || componentData.returnDate;
    const airline = componentData.airline || 'N/A';
    const flightNumber = componentData.flightNumber || '';
    const duration = componentData.duration || '';
    const numberOfStops = componentData.numberOfStops || 0;
    
    // Descrição detalhada
    const description = componentData.description || 
        `Voo ${airline} ${flightNumber} - ${origin} → ${destination} - Duração: ${duration} - Paradas: ${numberOfStops}`;
    
    const component = await PackageComponents.create({
        packageId: componentData.packageId,
        name: `${airline} ${flightNumber} - ${origin} → ${destination}`,
        type: 'FLIGHT',
        description,
        amadeusId: componentData.id || componentData.amadeusId,
        moneyPrice: Number(componentData.moneyPrice ?? 0),
        milesPrice: Number(componentData.milesPrice ?? 0),
        origin,
        destination,
        departureDate,
        returnDate
    }, {transaction});
    
    console.log('✅ Voo criado:', component.toJSON());
    return component;
};

export const createHotelComponent = async (componentData, transaction = null) => {
    console.log('🏨 Criando componente de hotel:', componentData);
    
    const name = componentData.hotel?.name || componentData.name || 'Hotel';
    const checkin = componentData.checkin;
    const checkout = componentData.checkout;
    const description = componentData.description || `Estadia de ${checkin} a ${checkout}`;
    
    const component = await PackageComponents.create({
        packageId: componentData.packageId,
        type: 'HOTEL',
        name: name,
        description: description,
        amadeusId: componentData.id || componentData.amadeusId,
        moneyPrice: Number(componentData.moneyPrice ?? 0),
        milesPrice: Number(componentData.milesPrice ?? 0),
        checkin,
        checkout
    }, {transaction});
    
    console.log('✅ Hotel criado:', component.toJSON());
    return component;
};

export const createActivityComponent = async (componentData, transaction = null) => {
    console.log('🎯 Criando componente de atividade:', componentData);
    
    const name = componentData.name || `Atividade`;
    const description = componentData.description || componentData.shortDescription || '';
    const destination = componentData.destination;
    
    const component = await PackageComponents.create({
        packageId: componentData.packageId,
        name: name,
        type: 'ACTIVITY',
        description,
        amadeusId: componentData.id || componentData.amadeusId,
        moneyPrice: Number(componentData.moneyPrice ?? 0),
        milesPrice: Number(componentData.milesPrice ?? 0),
        destination,
    }, {transaction});
    
    console.log('✅ Atividade criada:', component.toJSON());
    return component;
};

export const createCarRentalComponent = async (componentData, transaction = null) => {
    console.log('🚗 Criando componente de carro:', componentData);
    
    const vehicleInfo = componentData.vehicle || {};
    const name = `${vehicleInfo.make || 'Carro'} ${vehicleInfo.model || ''}`.trim() || 'Aluguel de Carro';
    const description = componentData.description || 
        `${vehicleInfo.category || ''} - ${vehicleInfo.transmission || ''}`.trim();
    const destination = componentData.destination;
    
    const component = await PackageComponents.create({
        packageId: componentData.packageId,
        name: name,
        type: 'CAR_RENTAL',
        description,
        amadeusId: componentData.id || componentData.amadeusId,
        moneyPrice: Number(componentData.moneyPrice ?? 0),
        milesPrice: Number(componentData.milesPrice ?? 0),
        destination,
    }, {transaction});
    
    console.log('✅ Carro criado:', component.toJSON());
    return component;
};
